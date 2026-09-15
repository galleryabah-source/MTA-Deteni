export type CertificationControl = Readonly<{
  controlId: string;
  evidenceId: string;
  observed: boolean;
  passed: boolean;
}>;

export type ControlledNonprodCertification = Readonly<{
  certificationId: string;
  target: "CONTROLLED_NONPROD";
  controls: readonly CertificationControl[];
  migrationFreeze: true;
  aiEnabled: false;
  productionAuthorized: false;
  liveDatabaseApproved: false;
}>;

export function assertControlledNonprodCertification(input: ControlledNonprodCertification): void {
  if (!input.certificationId.trim() || input.controls.length === 0) throw new Error("NONPROD_CERTIFICATION_REQUIRED");
  if (input.target !== "CONTROLLED_NONPROD" || !input.migrationFreeze || input.aiEnabled || input.productionAuthorized || input.liveDatabaseApproved) throw new Error("NONPROD_CERTIFICATION_GOVERNANCE_BLOCKED");
  for (const control of input.controls) {
    if (!control.controlId.trim() || !control.evidenceId.trim()) throw new Error("NONPROD_CERTIFICATION_EVIDENCE_REQUIRED");
    if (!control.observed) throw new Error(`NONPROD_CERTIFICATION_NOT_OBSERVED:${control.controlId}`);
    if (!control.passed) throw new Error(`NONPROD_CERTIFICATION_FAILED:${control.controlId}`);
  }
}
