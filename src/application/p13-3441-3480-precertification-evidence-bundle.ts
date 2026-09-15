export type EvidenceBundleItem = Readonly<{
  evidenceId: string;
  controlId: string;
  description: string;
  observable: boolean;
  passed: boolean;
}>;

export type PreCertificationEvidenceBundle = Readonly<{
  bundleId: string;
  items: readonly EvidenceBundleItem[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export function assertPreCertificationEvidenceBundle(bundle: PreCertificationEvidenceBundle): void {
  if (!bundle.bundleId.trim() || bundle.items.length === 0) throw new Error("PRECERT_EVIDENCE_BUNDLE_REQUIRED");
  if (!bundle.syntheticOnly || bundle.productionAuthorized) throw new Error("PRECERT_EVIDENCE_GOVERNANCE_BLOCKED");
  for (const item of bundle.items) {
    if (!item.evidenceId.trim() || !item.controlId.trim() || !item.description.trim()) throw new Error("PRECERT_EVIDENCE_IDENTITY_REQUIRED");
    if (!item.observable) throw new Error(`PRECERT_EVIDENCE_NOT_OBSERVABLE:${item.controlId}`);
    if (!item.passed) throw new Error(`PRECERT_EVIDENCE_FAILED:${item.controlId}`);
  }
}
