export type FinalEvidenceStatus = "CONTRACT_READY" | "OBSERVATION_PENDING" | "OBSERVATION_INCOMPLETE" | "CERTIFIED" | "BLOCKED";

export type FinalEvidenceStatusInput = Readonly<{
  contractReady: boolean;
  allRequiredControlsObserved: boolean;
  allRequiredControlsPassed: boolean;
  productionAuthorized: false;
}>;

export function deriveFinalEvidenceStatus(input: FinalEvidenceStatusInput): FinalEvidenceStatus {
  if (input.productionAuthorized) return "BLOCKED";
  if (!input.contractReady) return "BLOCKED";
  if (!input.allRequiredControlsObserved) return "OBSERVATION_PENDING";
  if (!input.allRequiredControlsPassed) return "OBSERVATION_INCOMPLETE";
  return "CERTIFIED";
}

export function assertProductionBoundary(status: FinalEvidenceStatus, productionAuthorized: false): void {
  if (productionAuthorized) throw new Error("FINAL_EVIDENCE_PRODUCTION_AUTHORIZATION_INVALID");
  if (status === "CERTIFIED") {
    // Certification here means controlled non-production evidence only.
    return;
  }
}
