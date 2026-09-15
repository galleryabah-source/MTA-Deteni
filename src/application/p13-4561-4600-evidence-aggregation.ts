export type EvidenceResult = Readonly<{
  evidenceId: string;
  controlId: string;
  status: "PASS" | "FAIL" | "NOT_RUN";
  outputIdentity: string;
}>;

export function assertEvidenceAggregation(results: readonly EvidenceResult[]): void {
  if (results.length === 0) throw new Error("EVIDENCE_AGGREGATION_REQUIRED");
  for (const result of results) {
    if (!result.evidenceId.trim() || !result.controlId.trim() || !result.outputIdentity.trim()) throw new Error("EVIDENCE_IDENTITY_REQUIRED");
    if (result.status !== "PASS") throw new Error(`EVIDENCE_NOT_CERTIFIED:${result.controlId}:${result.status}`);
  }
}
