export type ReleaseGateDecision = "BLOCKED" | "READY";

export type ReleaseGateEvidence = Readonly<{
  syntheticOnly: boolean;
  migrationFreeze: boolean;
  aiEnabled: boolean;
  productionAuthorized: boolean;
  reconciliationMatched: boolean;
  workflowApproved: boolean;
  executionCertified: boolean;
}>;

export function evaluateReleaseGate(evidence: ReleaseGateEvidence): ReleaseGateDecision {
  return evidence.syntheticOnly && evidence.migrationFreeze && !evidence.aiEnabled && !evidence.productionAuthorized && evidence.reconciliationMatched && evidence.workflowApproved && evidence.executionCertified ? "READY" : "BLOCKED";
}
