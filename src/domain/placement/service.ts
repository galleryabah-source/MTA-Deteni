import type { ActorContext } from "../shared/contracts.js";
import { DomainError } from "../shared/errors.js";

export type Placement = Readonly<{ detaineeId: string; blockId: string; roomId: string; bedId: string; version: number; active: boolean; updatedAt: string }>;
export type PlacementRepository = { getCurrent(detaineeId: string): Promise<Placement | null>; getBedOccupant(bedId: string): Promise<string | null>; save(placement: Placement, expectedVersion: number | null): Promise<void> };
export type PlacementDeps = Readonly<{ repository: PlacementRepository; now: () => string; canManage: (actor: ActorContext) => boolean }>;

export class PlacementService {
  constructor(private readonly deps: PlacementDeps) {}
  async assign(input: { detaineeId: string; blockId: string; roomId: string; bedId: string; actor: ActorContext }): Promise<Placement> {
    this.assertActor(input.actor);
    for (const value of [input.detaineeId, input.blockId, input.roomId, input.bedId]) if (!value.trim()) throw new DomainError("VALIDATION_FAILED", "Placement identifiers are required.");
    if (await this.deps.repository.getBedOccupant(input.bedId)) throw new DomainError("CONFLICT", "Bed is already occupied.");
    const current = await this.deps.repository.getCurrent(input.detaineeId);
    if (current?.active) throw new DomainError("CONFLICT", "Detainee already has an active placement.");
    const placement: Placement = { detaineeId: input.detaineeId, blockId: input.blockId, roomId: input.roomId, bedId: input.bedId, version: (current?.version ?? 0) + 1, active: true, updatedAt: this.deps.now() };
    await this.deps.repository.save(placement, current?.version ?? null);
    return placement;
  }
  async close(detaineeId: string, actor: ActorContext): Promise<Placement> {
    this.assertActor(actor);
    const current = await this.deps.repository.getCurrent(detaineeId);
    if (!current?.active) throw new DomainError("INVALID_STATE", "No active placement exists.");
    const closed: Placement = { ...current, active: false, version: current.version + 1, updatedAt: this.deps.now() };
    await this.deps.repository.save(closed, current.version);
    return closed;
  }
  private assertActor(actor: ActorContext): void { if (!this.deps.canManage(actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for placement."); }
}
