export type IntegratedControl = Readonly<{
  controlId: string;
  prerequisite: string;
  executed: boolean;
  passed: boolean;
  outputIdentity: string;
}>;

export type IntegratedExecutionResult = Readonly<{
  executionId: string;
  controls: readonly IntegratedControl[];
  syntheticOnly: true;
  productionAuthorized: false;
  liveDatabaseApproved: false;
}>;

export function assertIntegratedExecutionComplete(result: IntegratedExecutionResult): void {
  if (!result.executionId.trim() || result.controls.length === 0) throw new Error("INTEGRATED_EXECUTION_REQUIRED");
  if (!result.syntheticOnly || result.productionAuthorized || result.liveDatabaseApproved) throw new Error("INTEGRATED_EXECUTION_GOVERNANCE_BLOCKED");
  const identities = new Set<string>();
  for (const control of result.controls) {
    if (!control.controlId.trim() || !control.prerequisite.trim() || !control.outputIdentity.trim()) throw new Error("INTEGRATED_EXECUTION_EVIDENCE_REQUIRED");
    if (identities.has(control.outputIdentity)) throw new Error(`INTEGRATED_EXECUTION_OUTPUT_COLLISION:${control.outputIdentity}`);
    identities.add(control.outputIdentity);
    if (!control.executed) throw new Error(`INTEGRATED_EXECUTION_NOT_RUN:${control.controlId}`);
    if (!control.passed) throw new Error(`INTEGRATED_EXECUTION_FAILED:${control.controlId}`);
  }
}
