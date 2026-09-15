import type { ActorContext, TemporaryExitState } from "../shared/contracts";
import { DomainError } from "../shared/errors";
import { transition } from "./state-machine.mjs";

export type TemporaryExit = Readonly<{
  id: string;
  detaineeId: string;
  state: TemporaryExitState;
  requestedAt: string;
  plannedDepartureAt: string;
  plannedReturnAt: string;
  version: number;
}>;

export type TemporaryExitRepository = {
  get(id: string): Promise<TemporaryExit | null>;
  save(exit: TemporaryExit, expectedVersion: number | null): Promise<void>;
};

export type TemporaryExitDeps = Readonly<{
  repository: TemporaryExitRepository;
  now: () => string;
  canManage: (actor: ActorContext) => boolean;
}>;

export class TemporaryExitService {
  constructor(private readonly deps: TemporaryExitDeps) {}

  async request(input: {
    id: string;
    detaineeId: string;
    plannedDepartureAt: string;
    plannedReturnAt: string;
    actor: ActorContext;
  }): Promise<TemporaryExit> {
    if (!this.deps.canManage(input.actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for temporary exit.");
    if (!input.id.trim() || !input.detaineeId.trim()) throw new DomainError("VALIDATION_FAILED", "Exit identifiers are required.");
    if (input.plannedReturnAt <= input.plannedDepartureAt) throw new DomainError("VALIDATION_FAILED", "Return time must be after departure time.");
    if (await this.deps.repository.get(input.id)) throw new DomainError("CONFLICT", "Temporary exit already exists.");
    const exit: TemporaryExit = { id: input.id, detaineeId: input.detaineeId, state: "REQUESTED", requestedAt: this.deps.now(), plannedDepartureAt: input.plannedDepartureAt, plannedReturnAt: input.plannedReturnAt, version: 1 };
    await this.deps.repository.save(exit, null);
    return exit;
  }

  async advance(id: string, to: TemporaryExitState, actor: ActorContext): Promise<TemporaryExit> {
    if (!this.deps.canManage(actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for temporary exit.");
    const current = await this.deps.repository.get(id);
    if (!current) throw new DomainError("VALIDATION_FAILED", "Temporary exit not found.");
    const result = transition(current.state, to);
    if (!result.ok) throw new DomainError("INVALID_STATE", `Invalid temporary-exit transition: ${current.state} → ${to}.`);
    const updated = { ...current, state: result.state, version: current.version + 1 };
    await this.deps.repository.save(updated, current.version);
    return updated;
  }
}
