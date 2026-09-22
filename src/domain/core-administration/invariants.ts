import type { DetaineeStatus, Provenance } from "./shared/contracts.js";
import { DomainError } from "./shared/errors.js";

export function assertDetaineeRegistration(input: {
  id: string;
  identityRef: string;
  provenance: Provenance;
}): void {
  if (!input.id.trim() || !input.identityRef.trim()) {
    throw new DomainError("VALIDATION_FAILED", "Detainee identity fields are required.");
  }
  if (!input.provenance.capturedAt.trim()) {
    throw new DomainError("VALIDATION_FAILED", "Detainee provenance timestamp is required.");
  }
  if (!input.provenance.verified) {
    throw new DomainError("VALIDATION_FAILED", "Detainee provenance must be verified.");
  }
  if (input.provenance.verifiedBy !== undefined && !input.provenance.verifiedBy.trim()) {
    throw new DomainError("VALIDATION_FAILED", "Verified-by identity cannot be empty.");
  }
}

export function assertDetaineeStatusTransition(from: DetaineeStatus, to: DetaineeStatus): void {
  const allowed: Record<DetaineeStatus, readonly DetaineeStatus[]> = {
    ACTIVE: ["TRANSFERRED", "DEPARTED", "CLOSED"],
    TRANSFERRED: ["ACTIVE", "DEPARTED", "CLOSED"],
    DEPARTED: ["CLOSED"],
    CLOSED: [],
  };
  if (!allowed[from].includes(to)) {
    throw new DomainError("INVALID_STATE", `Invalid detainee status transition: ${from} → ${to}.`);
  }
}
