import type { ActorContext } from "../shared/contracts";
import { DomainError } from "../shared/errors";

export type EscortAssignment = Readonly<{
  id: string;
  temporaryExitId: string;
  officerIds: readonly string[];
  status: "ASSIGNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  assignedAt: string;
  version: number;
}>;

export type EscortRepository = {
  getByExit(exitId: string): Promise<EscortAssignment | null>;
  save(assignment: EscortAssignment, expectedVersion: number | null): Promise<void>;
};

export type EscortDeps = Readonly<{
  repository: EscortRepository;
  now: () => string;
  canManage: (actor: ActorContext) => boolean;
}>;

export class EscortService {
  constructor(private readonly deps: EscortDeps) {}

  async assign(input: { id: string; temporaryExitId: string; officerIds: readonly string[]; actor: ActorContext }): Promise<EscortAssignment> {
    if (!this.deps.canManage(input.actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for escort.");
    if (!input.id.trim() || !input.temporaryExitId.trim() || input.officerIds.length === 0) throw new DomainError("VALIDATION_FAILED", "Escort assignment requires an exit and at least one officer.");
    if (await this.deps.repository.getByExit(input.temporaryExitId)) throw new DomainError("CONFLICT", "An escort assignment already exists for this exit.");
    const assignment: EscortAssignment = { id: input.id, temporaryExitId: input.temporaryExitId, officerIds: [...input.officerIds], status: "ASSIGNED", assignedAt: this.deps.now(), version: 1 };
    await this.deps.repository.save(assignment, null);
    return assignment;
  }

  async setStatus(id: string, status: EscortAssignment["status"], actor: ActorContext): Promise<EscortAssignment> {
    if (!this.deps.canManage(actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for escort.");
    const current = await this.deps.repository.getByExit(id);
    if (!current) throw new DomainError("VALIDATION_FAILED", "Escort assignment not found.");
    if (current.status === "COMPLETED" || current.status === "CANCELLED") throw new DomainError("INVALID_STATE", "Escort assignment is terminal.");
    const updated = { ...current, status, version: current.version + 1 };
    await this.deps.repository.save(updated, current.version);
    return updated;
  }
}
