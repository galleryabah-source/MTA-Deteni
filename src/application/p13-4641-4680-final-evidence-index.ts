export type ReleaseEvidenceLink = Readonly<{
  requirementId: string;
  controlId: string;
  evidenceId: string;
  outputIdentity: string;
  status: "PASS" | "FAIL" | "NOT_RUN";
}>;

export type FinalEvidenceIndex = Readonly<{
  indexId: string;
  links: readonly ReleaseEvidenceLink[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export function assertFinalEvidenceIndex(input: FinalEvidenceIndex): void {
  if (!input.indexId.trim() || input.links.length === 0) throw new Error("FINAL_EVIDENCE_INDEX_REQUIRED");
  if (!input.syntheticOnly || input.productionAuthorized) throw new Error("FINAL_EVIDENCE_INDEX_GOVERNANCE_BLOCKED");
  for (const link of input.links) {
    if (!link.requirementId.trim() || !link.controlId.trim() || !link.evidenceId.trim() || !link.outputIdentity.trim()) throw new Error("FINAL_EVIDENCE_LINK_IDENTITY_REQUIRED");
    if (link.status !== "PASS") throw new Error(`FINAL_EVIDENCE_LINK_NOT_CERTIFIED:${link.requirementId}`);
  }
}
