export type ReconciliationEvidence = Readonly<{
  reconciliationId: string;
  aggregateId: string;
  detaineeId: string;
  expectedCount: number;
  observedCount: number;
  checkedAt: string;
  status: "MATCH" | "MISMATCH";
  evidenceIds: readonly string[];
}>;

export function buildReconciliationEvidence(input: Omit<ReconciliationEvidence, "status">): ReconciliationEvidence {
  if (!input.reconciliationId.trim() || !input.aggregateId.trim() || !input.detaineeId.trim() || !input.checkedAt.trim()) throw new Error("RECONCILIATION_IDENTITY_REQUIRED");
  if (input.expectedCount < 0 || input.observedCount < 0) throw new Error("RECONCILIATION_COUNT_INVALID");
  if (input.evidenceIds.length === 0) throw new Error("RECONCILIATION_EVIDENCE_REQUIRED");
  return { ...input, status: input.expectedCount === input.observedCount ? "MATCH" : "MISMATCH" };
}
