import type { ActorContext } from "../shared/contracts.js";
import { DomainError } from "../shared/errors.js";
import { assertChronology, assertMovementIdentity, assertMovementReferences } from "./invariants.js";

export type MovementEvent = Readonly<{ id: string; detaineeId: string; type: "IN" | "OUT" | "TRANSFER" | "TEMPORARY_EXIT_DEPARTURE" | "TEMPORARY_EXIT_RETURN"; fromPlacementRef?: string; toPlacementRef?: string; occurredAt: string; actorId: string; correlationId: string }>;
export type MovementRepository = { append(event: MovementEvent): Promise<void>; listSince(detaineeId: string, since: string): Promise<readonly MovementEvent[]> };
export type HeadcountProjection = Readonly<{ occupied: number; outside: number; unknown: number; asOf: string }>;
export type MovementDeps = Readonly<{ repository: MovementRepository; now: () => string; canManage: (actor: ActorContext) => boolean }>;

export class MovementService {
  constructor(private readonly deps: MovementDeps) {}

  async record(input: Omit<MovementEvent, "occurredAt" | "actorId" | "correlationId"> & { actor: ActorContext; occurredAt?: string }): Promise<MovementEvent> {
    if (!this.deps.canManage(input.actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for movement.");
    assertMovementIdentity({ id: input.id, detaineeId: input.detaineeId, actorId: input.actor.actorId, correlationId: input.actor.correlationId });
    assertMovementReferences(input);
    const occurredAt = input.occurredAt ?? this.deps.now();
    if (!occurredAt.trim()) throw new DomainError("VALIDATION_FAILED", "Movement occurrence time is required.");
    const priorEvents = await this.deps.repository.listSince(input.detaineeId, "0000-01-01T00:00:00.000Z");
    const previous = [...priorEvents].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0] ?? null;
    const event: MovementEvent = { id: input.id, detaineeId: input.detaineeId, type: input.type, ...(input.fromPlacementRef ? { fromPlacementRef: input.fromPlacementRef } : {}), ...(input.toPlacementRef ? { toPlacementRef: input.toPlacementRef } : {}), occurredAt, actorId: input.actor.actorId, correlationId: input.actor.correlationId };
    assertChronology(event, previous);
    await this.deps.repository.append(event);
    return event;
  }

  async reconcileHeadcount(input: { detaineeIds: readonly string[]; since: string; actor: ActorContext }): Promise<HeadcountProjection> {
    if (!this.deps.canManage(input.actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for headcount.");
    if (!input.since.trim()) throw new DomainError("VALIDATION_FAILED", "Headcount cutoff is required.");
    const events = (await Promise.all(input.detaineeIds.map((id) => this.deps.repository.listSince(id, input.since)))).flat();
    const latest = new Map<string, MovementEvent>();
    for (const event of events.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))) latest.set(event.detaineeId, event);
    let outside = 0; let unknown = 0;
    for (const id of input.detaineeIds) { const event = latest.get(id); if (!event) unknown++; else if (event.type === "OUT" || event.type === "TEMPORARY_EXIT_DEPARTURE") outside++; }
    return { occupied: input.detaineeIds.length - outside - unknown, outside, unknown, asOf: this.deps.now() };
  }
}