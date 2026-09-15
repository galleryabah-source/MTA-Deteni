export type CertificationEvidence = Readonly<{
  evidenceId: string;
  controlId: string;
  source: "TEST" | "CI" | "LOCAL_EXECUTION";
  status: "PASS" | "FAIL" | "NOT_RUN";
  outputIdentity: string;
}>;

export type CertificationEvidencePackage = Readonly<{
  packageId: string;
  evidence: readonly CertificationEvidence[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export function assertCertificationEvidencePackage(pkg: CertificationEvidencePackage): void {
  if (!pkg.packageId.trim() || pkg.evidence.length === 0) throw new Error("CERT_EVIDENCE_PACKAGE_REQUIRED");
  if (!pkg.syntheticOnly || pkg.productionAuthorized) throw new Error("CERT_EVIDENCE_GOVERNANCE_BLOCKED");
  for (const item of pkg.evidence) {
    if (!item.evidenceId.trim() || !item.controlId.trim() || !item.outputIdentity.trim()) throw new Error("CERT_EVIDENCE_IDENTITY_REQUIRED");
    if (item.status !== "PASS") throw new Error(`CERT_EVIDENCE_NOT_PASS:${item.controlId}`);
  }
}
