export type HarnessControl = Readonly<{
  controlId: string;
  name: string;
  executed: boolean;
  passed: boolean;
  outputIdentity: string;
}>;

export type SyntheticHarnessResult = Readonly<{
  harnessId: string;
  controls: readonly HarnessControl[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export function assertSyntheticHarnessComplete(result: SyntheticHarnessResult): void {
  if (!result.harnessId.trim() || result.controls.length === 0) throw new Error("SYNTHETIC_HARNESS_REQUIRED");
  if (!result.syntheticOnly || result.productionAuthorized) throw new Error("SYNTHETIC_HARNESS_GOVERNANCE_BLOCKED");
  for (const control of result.controls) {
    if (!control.controlId.trim() || !control.name.trim() || !control.outputIdentity.trim()) throw new Error("SYNTHETIC_HARNESS_EVIDENCE_REQUIRED");
    if (!control.executed) throw new Error(`SYNTHETIC_HARNESS_NOT_EXECUTED:${control.controlId}`);
    if (!control.passed) throw new Error(`SYNTHETIC_HARNESS_FAILED:${control.controlId}`);
  }
}
