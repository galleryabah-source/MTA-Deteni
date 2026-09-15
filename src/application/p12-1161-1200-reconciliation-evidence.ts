export type ReconciliationStatus = "MATCH" | "MISMATCH";

export type ReconciliationEvidence = Readonly<{
  reconciliationId: string;
  subject: string;
  expected: number;
  observed: number;
  status: ReconciliationStatus;
  generatedAt: string;
  sourceVersion: string;
}>;

export function buildReconciliationEvidence(input: Omit<ReconciliationEvidence, "status">): ReconciliationEvidence {
  if (!input.reconciliationId.trim() || !input.subject.trim() || !input.generatedAt.trim() || !input.sourceVersion.trim()) throw new Error("RECONCILIATION_IDENTITY_REQUIRED");
  if (!Number.isInteger(input.expected) || !Number.isInteger(input.observed) || input.expected < 0 || input.observed < 0) throw new Error("RECONCILIATION_COUNT_INVALID");
  return { ...input, status: input.expected === input.observed ? "MATCH" : "MISMATCH" };
}

export function assertReconciliationAllowsPromotion(evidence: ReconciliationEvidence): void {
  if (evidence.status !== "MATCH") throw new Error("RECONCILIATION_MISMATCH_BLOCKS_PROMOTION");
}
