export type EvidenceManifestItem = Readonly<{
  requirementId: string;
  contractId: string;
  evidenceId: string;
  outputIdentity: string;
  telemetryIdentity: string;
  status: "PASS" | "NOT_RUN" | "FAIL";
}>;

export type ReleaseEvidenceManifest = Readonly<{
  manifestId: string;
  items: readonly EvidenceManifestItem[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export function assertReleaseEvidenceManifestComplete(input: ReleaseEvidenceManifest): void {
  if (!input.manifestId.trim() || input.items.length === 0) throw new Error("RELEASE_EVIDENCE_MANIFEST_REQUIRED");
  if (!input.syntheticOnly || input.productionAuthorized) throw new Error("RELEASE_EVIDENCE_MANIFEST_GOVERNANCE_BLOCKED");
  const requirements = new Set<string>();
  for (const item of input.items) {
    if (!item.requirementId.trim() || !item.contractId.trim() || !item.evidenceId.trim() || !item.outputIdentity.trim() || !item.telemetryIdentity.trim()) throw new Error("RELEASE_EVIDENCE_IDENTITY_REQUIRED");
    if (requirements.has(item.requirementId)) throw new Error(`RELEASE_EVIDENCE_REQUIREMENT_DUPLICATE:${item.requirementId}`);
    requirements.add(item.requirementId);
    if (item.status !== "PASS") throw new Error(`RELEASE_EVIDENCE_NOT_CERTIFIED:${item.requirementId}`);
  }
}
