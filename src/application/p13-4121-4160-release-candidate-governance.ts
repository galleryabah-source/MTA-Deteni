export type ReleaseCandidateGovernance = Readonly<{
  syntheticOnly: true;
  migrationFreeze: true;
  aiEnabled: false;
  productionAuthorized: false;
  liveDatabaseApproved: false;
  traceabilityComplete: boolean;
  harnessEvidenceComplete: boolean;
  reportBoundaryComplete: boolean;
}>;

export function assertReleaseCandidateGovernance(input: ReleaseCandidateGovernance): void {
  if (!input.syntheticOnly || !input.migrationFreeze || input.aiEnabled || input.productionAuthorized || input.liveDatabaseApproved) throw new Error("RELEASE_CANDIDATE_GOVERNANCE_BLOCKED");
  if (!input.traceabilityComplete || !input.harnessEvidenceComplete || !input.reportBoundaryComplete) throw new Error("RELEASE_CANDIDATE_EVIDENCE_INCOMPLETE");
}
