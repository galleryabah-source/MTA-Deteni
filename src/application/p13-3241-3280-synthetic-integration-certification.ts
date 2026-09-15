export type CertificationControl = Readonly<{
  controlId: string;
  evidenceId: string;
  executed: boolean;
  passed: boolean;
}>;

export type SyntheticIntegrationCertification = Readonly<{
  certificationId: string;
  controls: readonly CertificationControl[];
  syntheticOnly: true;
  migrationFreeze: true;
  aiEnabled: false;
  productionAuthorized: false;
}>;

export function assertSyntheticIntegrationCertification(certification: SyntheticIntegrationCertification): void {
  if (!certification.certificationId.trim()) throw new Error("CERTIFICATION_ID_REQUIRED");
  if (!certification.syntheticOnly || !certification.migrationFreeze || certification.aiEnabled || certification.productionAuthorized) throw new Error("CERTIFICATION_GOVERNANCE_BLOCKED");
  if (certification.controls.length === 0) throw new Error("CERTIFICATION_CONTROLS_REQUIRED");
  for (const control of certification.controls) {
    if (!control.controlId.trim() || !control.evidenceId.trim()) throw new Error("CERTIFICATION_EVIDENCE_REQUIRED");
    if (!control.executed) throw new Error(`CERTIFICATION_NOT_EXECUTED:${control.controlId}`);
    if (!control.passed) throw new Error(`CERTIFICATION_CONTROL_FAILED:${control.controlId}`);
  }
}
