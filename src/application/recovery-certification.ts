import type { RecoveryEvidence } from "./recovery-evidence.js";
import type { RecoveryRetryRecord } from "./recovery-retry.js";
import type { RecoveryJourneyOutcome } from "./recovery-journey.js";

export type RecoveryCertification = Readonly<{
  journeyId: string;
  outcome: RecoveryJourneyOutcome;
  evidenceCount: number;
  mutationCount: number;
  auditCount: number;
  outboxCount: number;
  retryCount: number;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyRecoveryJourney(input: {
  journeyId: string;
  outcome: RecoveryJourneyOutcome;
  evidence: readonly RecoveryEvidence[];
  retries: readonly RecoveryRetryRecord[];
  mutationCount: number;
  auditCount: number;
  outboxCount: number;
}): RecoveryCertification {
  if (!input.journeyId.trim()) throw new Error("Recovery certification journey identity is required.");
  if (input.evidence.length !== 1) throw new Error("Recovery certification requires exactly one failure evidence record.");
  if (![input.mutationCount, input.auditCount, input.outboxCount].every((value) => Number.isInteger(value) && value >= 0)) throw new Error("Recovery effect cardinality is invalid.");
  if (input.mutationCount !== input.auditCount || input.mutationCount !== input.outboxCount) throw new Error("Recovery mutation/audit/outbox cardinality mismatch.");
  const committed = input.evidence[0].mutationCommitted;
  if (committed !== (input.mutationCount === 1)) throw new Error("Recovery evidence and mutation cardinality mismatch.");
  if (!committed && input.retries.length !== 0) throw new Error("Rejected recovery cannot produce retry records.");
  if (committed) {
    if (input.retries.length !== 2) throw new Error("Committed recovery requires first-attempt and deduplication evidence.");
    if (input.retries[0]?.decision !== "RETRY" || input.retries[1]?.decision !== "SKIP_DUPLICATE") throw new Error("Committed recovery retry sequence is not canonical.");
    if (input.retries[0]?.retryKey !== input.retries[1]?.retryKey) throw new Error("Recovery retry identity drift detected.");
  }
  if (input.evidence.some((item) => !item.syntheticOnly)) throw new Error("Recovery certification accepts synthetic evidence only.");
  return Object.freeze({ journeyId: input.journeyId, outcome: input.outcome, evidenceCount: input.evidence.length, mutationCount: input.mutationCount, auditCount: input.auditCount, outboxCount: input.outboxCount, retryCount: input.retries.length, certified: true, syntheticOnly: true });
}
