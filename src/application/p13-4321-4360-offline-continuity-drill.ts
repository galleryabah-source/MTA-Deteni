export type ContinuityDrillStep = Readonly<{
  stepId: string;
  name: string;
  executed: boolean;
  passed: boolean;
  evidenceId: string;
}>;

export type OfflineContinuityDrill = Readonly<{
  drillId: string;
  localServerReady: boolean;
  lanClientsTrusted: boolean;
  offlineReadOnly: boolean;
  replayOrdered: boolean;
  conflictsHumanReviewed: boolean;
  revokedDeviceRejected: boolean;
  restoreVerified: boolean;
  steps: readonly ContinuityDrillStep[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export function assertOfflineContinuityDrillComplete(input: OfflineContinuityDrill): void {
  if (!input.drillId.trim() || input.steps.length === 0) throw new Error("OFFLINE_CONTINUITY_DRILL_REQUIRED");
  if (!input.syntheticOnly || input.productionAuthorized) throw new Error("OFFLINE_CONTINUITY_DRILL_GOVERNANCE_BLOCKED");
  if (!input.localServerReady || !input.lanClientsTrusted || !input.offlineReadOnly || !input.replayOrdered || !input.conflictsHumanReviewed || !input.revokedDeviceRejected || !input.restoreVerified) throw new Error("OFFLINE_CONTINUITY_DRILL_CONTROLS_INCOMPLETE");
  for (const step of input.steps) {
    if (!step.stepId.trim() || !step.name.trim() || !step.evidenceId.trim()) throw new Error("OFFLINE_CONTINUITY_STEP_EVIDENCE_REQUIRED");
    if (!step.executed) throw new Error(`OFFLINE_CONTINUITY_STEP_NOT_RUN:${step.stepId}`);
    if (!step.passed) throw new Error(`OFFLINE_CONTINUITY_STEP_FAILED:${step.stepId}`);
  }
}
