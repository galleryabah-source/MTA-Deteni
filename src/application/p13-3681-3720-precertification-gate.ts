export type PreCertificationGate = Readonly<{
  syntheticJourney: boolean;
  reportDeterminism: boolean;
  rolePermissionRegression: boolean;
  offlineOnlineReconciliation: boolean;
  evidencePackage: boolean;
  migrationFreeze: true;
  aiEnabled: false;
  productionAuthorized: false;
}>;

export function assertPreCertificationReady(gate: PreCertificationGate): void {
  if (!gate.migrationFreeze || gate.aiEnabled || gate.productionAuthorized) throw new Error("PRECERTIFICATION_GOVERNANCE_BLOCKED");
  if (!gate.syntheticJourney || !gate.reportDeterminism || !gate.rolePermissionRegression || !gate.offlineOnlineReconciliation || !gate.evidencePackage) throw new Error("PRECERTIFICATION_CONTROLS_INCOMPLETE");
}
