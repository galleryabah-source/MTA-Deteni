export type ReleaseCandidateGate = Readonly<{
  syntheticJourney: boolean;
  harnessExecuted: boolean;
  shellConverged: boolean;
  reportExecutionBoundaryReady: boolean;
  traceabilityComplete: boolean;
  governanceSafe: boolean;
}>;

export function assertReleaseCandidateReady(gate: ReleaseCandidateGate): void {
  if (!gate.syntheticJourney || !gate.harnessExecuted || !gate.shellConverged || !gate.reportExecutionBoundaryReady || !gate.traceabilityComplete || !gate.governanceSafe) throw new Error("RELEASE_CANDIDATE_NOT_READY");
}
