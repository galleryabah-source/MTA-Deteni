import { DomainError } from "../shared/errors.js";
import type { MovementEvent } from "./service.js";

export function assertMovementIdentity(input: { id: string; detaineeId: string; actorId: string; correlationId: string }): void {
  for (const [name, value] of Object.entries(input)) {
    if (!value.trim()) throw new DomainError("VALIDATION_FAILED", `Movement ${name} is required.`);
  }
}

export function assertMovementReferences(input: Pick<MovementEvent, "type" | "fromPlacementRef" | "toPlacementRef">): void {
  if (input.type === "TRANSFER") {
    if (!input.fromPlacementRef?.trim() || !input.toPlacementRef?.trim()) {
      throw new DomainError("VALIDATION_FAILED", "Transfer requires both origin and destination placement references.");
    }
    if (input.fromPlacementRef === input.toPlacementRef) {
      throw new DomainError("INVALID_STATE", "Transfer origin and destination must differ.");
    }
  }
  if (input.type === "IN" && input.fromPlacementRef) {
    throw new DomainError("VALIDATION_FAILED", "IN movement cannot have an origin placement.");
  }
  if (input.type === "OUT" && input.toPlacementRef) {
    throw new DomainError("VALIDATION_FAILED", "OUT movement cannot have a destination placement.");
  }
  if (input.type === "TEMPORARY_EXIT_DEPARTURE" && input.toPlacementRef) {
    throw new DomainError("VALIDATION_FAILED", "Temporary exit departure cannot create a destination placement.");
  }
  if (input.type === "TEMPORARY_EXIT_RETURN" && input.fromPlacementRef) {
    throw new DomainError("VALIDATION_FAILED", "Temporary exit return cannot declare an origin placement.");
  }
}

export function assertChronology(event: MovementEvent, previous: MovementEvent | null): void {
  if (previous && event.occurredAt < previous.occurredAt) {
    throw new DomainError("INVALID_STATE", "Movement event cannot precede the latest known movement.");
  }
}
