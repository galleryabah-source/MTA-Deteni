import { DomainError } from "../shared/errors.js";
import type { Placement } from "./service.js";

export function assertPlacementIdentity(input: {
  detaineeId: string;
  blockId: string;
  roomId: string;
  bedId: string;
}): void {
  for (const [name, value] of Object.entries(input)) {
    if (!value.trim()) throw new DomainError("VALIDATION_FAILED", `Placement ${name} is required.`);
  }
}

export function assertBedAvailable(occupantId: string | null, detaineeId: string): void {
  if (occupantId && occupantId !== detaineeId) {
    throw new DomainError("CONFLICT", "Bed is already occupied.");
  }
}

export function assertNoActivePlacement(current: Placement | null): void {
  if (current?.active) throw new DomainError("CONFLICT", "Detainee already has an active placement.");
}

export function assertPlacementConcurrency(current: Placement | null, expectedVersion: number | null): void {
  const actual = current?.version ?? null;
  if (actual !== expectedVersion) {
    throw new DomainError("STALE_STATE", "Placement changed concurrently.", true);
  }
}
