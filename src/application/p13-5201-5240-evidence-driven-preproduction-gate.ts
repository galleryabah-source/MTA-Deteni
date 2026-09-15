export type PreproductionGateInput = Readonly<{
  executionPlanCertified: boolean;
  observationLedgerComplete: boolean;
  browserLanAccepted: boolean;
  reportFidelityAccepted: boolean;
  recoveryRehearsalVerified: boolean;
  securityReviewPassed: boolean;
  migrationFreeze: true;
  aiEnabled: false;
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export type PreproductionGateStatus = "BLOCKED" | "OBSERVATION_PENDING" | "READY_FOR_HUMAN_APPROVAL";

export function derivePreproductionGateStatus(input: PreproductionGateInput): PreproductionGateStatus {
  if (!input.migrationFreeze || input.aiEnabled || !input.syntheticOnly || input.productionAuthorized) return "BLOCKED";
  const required = [
    input.executionPlanCertified,
    input.observationLedgerComplete,
    input.browserLanAccepted,
    input.reportFidelityAccepted,
    input.recoveryRehearsalVerified,
    input.securityReviewPassed,
  ];
  if (required.every(Boolean)) return "READY_FOR_HUMAN_APPROVAL";
  return "OBSERVATION_PENDING";
}

export function assertReadyForHumanApproval(input: PreproductionGateInput): void {
  const status = derivePreproductionGateStatus(input);
  if (status !== "READY_FOR_HUMAN_APPROVAL") throw new Error(`PREPRODUCTION_GATE_NOT_READY:${status}`);
}
