export type IntegratedPreReleaseGate = Readonly<{
  integratedExecution: boolean;
  reportRenderingVerification: boolean;
  roleJourneyMatrix: boolean;
  offlineContinuityDrill: boolean;
  evidenceManifest: boolean;
  migrationFreeze: true;
  aiEnabled: false;
  productionAuthorized: false;
  liveDatabaseApproved: false;
}>;

export function assertIntegratedPreReleaseReady(input: IntegratedPreReleaseGate): void {
  if (!input.migrationFreeze || input.aiEnabled || input.productionAuthorized || input.liveDatabaseApproved) throw new Error("PRE_RELEASE_GOVERNANCE_BLOCKED");
  if (!input.integratedExecution || !input.reportRenderingVerification || !input.roleJourneyMatrix || !input.offlineContinuityDrill || !input.evidenceManifest) throw new Error("PRE_RELEASE_CONTROLS_INCOMPLETE");
}
