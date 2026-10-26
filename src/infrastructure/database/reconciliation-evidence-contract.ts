export const RECONCILIATION_EVIDENCE_CONTRACT_VERSION = "P9.15-v1";

export interface ReconciliationEvidence {
  evidenceId: string;
  contractVersion: string;
  generatedAt: string;
  environment: "DEVELOPMENT" | "TEST" | "STAGING" | "PRODUCTION";
  items: Array<{
    schema: string;
    name: string;
    kind: string;
    status: "MATCH" | "MISMATCH" | "MISSING" | "UNEXPECTED" | "UNVERIFIED";
    expectedFingerprint?: string;
    actualFingerprint?: string;
  }>;
}

export function certifyReconciliationEvidence(evidence: ReconciliationEvidence):
  "PASS" | "NOT_CERTIFIED" {
  if (!evidence.evidenceId || !evidence.contractVersion || !evidence.generatedAt) return "NOT_CERTIFIED";
  if (evidence.items.length === 0) return "NOT_CERTIFIED";
  return evidence.items.every((item) =>
    item.status === "MATCH" &&
    Boolean(item.expectedFingerprint) &&
    Boolean(item.actualFingerprint) &&
    item.expectedFingerprint === item.actualFingerprint
  ) ? "PASS" : "NOT_CERTIFIED";
}
