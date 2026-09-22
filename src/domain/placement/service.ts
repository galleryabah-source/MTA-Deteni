import type { ActorContext } from "../shared/contracts.js";
import { DomainError } from "../shared/errors.js";
import { assertBedAvailable, assertNoActivePlacement, assertPlacementConcurrency, assertPlacementIdentity } from "./invariants.js";

export type Placement = Readonly<{ detaineeId: string; blockId: string; roomId: string; bedId: string; version: number; active: boolean; updatedAt: string }>;
export type PlacementRepository = {
  getCurrent(detaineeId: string): Promise<Placement | null>;
  getBedOccupant(bedId: string): Promise<string | null>;
  save(placement: Placement, expectedVersion: number | null): Promise<void>;
};
export type PlacementDeps = Readonly<{ repository: PlacementRepository; now: () => string; canManage: (actor: ActorContext) => boolean }>;

export class PlacementService {
  constructor(private readonly deps: PlacementDeps) {}

  async assign(input: { detaineeId: string; blockId: string; roomId: string; bedId: string; actor: ActorContext }): Promise<Placement> {
    this.assertActor(input.actor);
    assertPlacementIdentity(input);
    const current = await this.deps.repository.getCurrent(input.detaineeId);
    assertNoActivePlacement(current);
    const occupant = await this.deps.repository.getBedOccupant(input.bedId);
    assertBedAvailable(occupant, input.detaineeId);
    assertPlacementConcurrency(current, current?.version ?? null);
    const placement: Placement = {
      detaineeId: input.detaineeId,
      blockId: input.blockId,
      roomId: input.roomId,
      bedId: input.bedId,
      version: (current?.version ?? 0) + 1,
      active: true,
      updatedAt: this.deps.now(),
    };
    await this.deps.repository.save(placement, current?.version ?? null);
    return placement;
  }

  async close(detaineeId: string, actor: ActorContext): Promise<Placement> {
    this.assertActor(actor);
    if (!detaineeId.trim()) throw new DomainError("VALIDATION_FAILED", "Detainee identifier is required.");
    const current = await this.deps.repository.getCurrent(detaineeId);
    if (!current?.active) throw new DomainError("INVALID_STATE", "No active placement exists.");
    assertPlacementConcurrency(current, current.version);
    const closed: Placement = { ...current, active: false, version: current.version + 1, updatedAt: this.deps.now() };
    await this.deps.repository.save(closed, current.version);
    return closed;
  }

  private assertActor(actor: ActorContext): void {
    if (!this.deps.canManage(actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for placement.");
  }
}
