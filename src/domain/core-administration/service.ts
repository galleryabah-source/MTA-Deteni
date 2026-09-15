import type {
  ActorContext,
  DetaineeStatus,
  Provenance,
} from "../shared/contracts.js";
import { DomainError } from "../shared/errors.js";

export type Detainee = Readonly<{
  id: string;
  status: DetaineeStatus;
  identityRef: string;
  provenance: Provenance;
  version: number;
  createdAt: string;
  updatedAt: string;
}>;

export type DetaineeRepository = {
  get(id: string): Promise<Detainee | null>;
  save(detainee: Detainee, expectedVersion: number | null): Promise<void>;
};

export type AuditPort = {
  append(event: { eventType: string; aggregateType: string; aggregateId: string; actorId: string; correlationId: string; payloadHash: string }): Promise<string>;
};

export type CoreAdministrationDeps = Readonly<{
  repository: DetaineeRepository;
  audit: AuditPort;
  now: () => string;
  canManage: (actor: ActorContext) => boolean;
}>;

const ALLOWED_STATUS_TRANSITIONS: Record<DetaineeStatus, readonly DetaineeStatus[]> = {
  ACTIVE: ["TRANSFERRED", "DEPARTED", "CLOSED"],
  TRANSFERRED: ["ACTIVE", "DEPARTED", "CLOSED"],
  DEPARTED: ["CLOSED"],
  CLOSED: [],
};

export class CoreAdministrationService {
  constructor(private readonly deps: CoreAdministrationDeps) {}

  async register(input: { id: string; identityRef: string; provenance: Provenance; actor: ActorContext }): Promise<Detainee> {
    this.assertActor(input.actor);
    if (!input.id.trim() || !input.identityRef.trim()) throw new DomainError("VALIDATION_FAILED", "Detainee identity fields are required.");
    if (!input.provenance.verified) throw new DomainError("VALIDATION_FAILED", "Detainee provenance must be verified.");
    if (await this.deps.repository.get(input.id)) throw new DomainError("CONFLICT", "Detainee already exists.");
    const now = this.deps.now();
    const detainee: Detainee = { id: input.id, status: "ACTIVE", identityRef: input.identityRef, provenance: input.provenance, version: 1, createdAt: now, updatedAt: now };
    await this.deps.repository.save(detainee, null);
    return detainee;
  }

  async changeStatus(input: { id: string; to: DetaineeStatus; actor: ActorContext }): Promise<Detainee> {
    this.assertActor(input.actor);
    const current = await this.deps.repository.get(input.id);
    if (!current) throw new DomainError("VALIDATION_FAILED", "Detainee not found.");
    if (!ALLOWED_STATUS_TRANSITIONS[current.status].includes(input.to)) throw new DomainError("INVALID_STATE", `Invalid detainee status transition: ${current.status} → ${input.to}.`);
    const updated: Detainee = { ...current, status: input.to, version: current.version + 1, updatedAt: this.deps.now() };
    await this.deps.repository.save(updated, current.version);
    await this.deps.audit.append({ eventType: "DETAINEE_STATUS_CHANGED", aggregateType: "DETAINEE", aggregateId: updated.id, actorId: input.actor.actorId, correlationId: input.actor.correlationId, payloadHash: `${current.status}:${input.to}:${updated.version}` });
    return updated;
  }

  private assertActor(actor: ActorContext): void {
    if (!this.deps.canManage(actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for core administration.");
  }
}
