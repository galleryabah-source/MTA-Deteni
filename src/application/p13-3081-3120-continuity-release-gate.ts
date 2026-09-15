export type ContinuityReleaseGate = Readonly<{
  sessionLifecycle: boolean;
  deviceRevocation: boolean;
  conflictResolution: boolean;
  evidenceChainSealed: boolean;
  syntheticE2E: boolean;
  migrationFreeze: true;
  aiEnabled: false;
  productionAuthorized: false;
}>;

export function assertContinuityReleaseReady(gate: ContinuityReleaseGate): void {
  if (!gate.migrationFreeze || gate.aiEnabled || gate.productionAuthorized) throw new Error("CONTINUITY_RELEASE_GOVERNANCE_BLOCKED");
  if (!gate.sessionLifecycle || !gate.deviceRevocation || !gate.conflictResolution || !gate.evidenceChainSealed || !gate.syntheticE2E) throw new Error("CONTINUITY_RELEASE_CONTROLS_INCOMPLETE");
}
