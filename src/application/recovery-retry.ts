import type { OutboxEvent } from "./outbox-contract.js";
import type { ReportingSnapshot } from "../domain/reporting/snapshot.js";

export type RecoveryRetryDecision = "RETRY" | "SKIP_DUPLICATE" | "REVIEW_REQUIRED";

export type RecoveryRetryRecord = Readonly<{
  retryKey: string;
  targetId: string;
  attempt: number;
  decision: RecoveryRetryDecision;
  sourceFingerprint: string;
  syntheticOnly: true;
}>;

export function createRecoveryRetryKey(commandId: string, sourceFingerprint: string): string {
  if (!commandId.trim() || !sourceFingerprint.trim()) throw new Error("Recovery retry key identity is required.");
  return `RETRY-${commandId}-${sourceFingerprint}`;
}

export function decideIdempotentRetry(input: { retryKey: string; targetId: string; sourceFingerprint: string; prior: readonly RecoveryRetryRecord[]; reviewRequired?: boolean }): RecoveryRetryRecord {
  for (const value of [input.retryKey, input.targetId, input.sourceFingerprint]) if (!value.trim()) throw new Error("Recovery retry identity is required.");
  const previous = input.prior.filter((item) => item.retryKey === input.retryKey);
  if (input.reviewRequired) return Object.freeze({ retryKey: input.retryKey, targetId: input.targetId, attempt: previous.length + 1, decision: "REVIEW_REQUIRED", sourceFingerprint: input.sourceFingerprint, syntheticOnly: true });
  if (previous.some((item) => item.sourceFingerprint === input.sourceFingerprint && item.decision === "RETRY")) return Object.freeze({ retryKey: input.retryKey, targetId: input.targetId, attempt: previous.length + 1, decision: "SKIP_DUPLICATE", sourceFingerprint: input.sourceFingerprint, syntheticOnly: true });
  return Object.freeze({ retryKey: input.retryKey, targetId: input.targetId, attempt: previous.length + 1, decision: "RETRY", sourceFingerprint: input.sourceFingerprint, syntheticOnly: true });
}

export function assertRecoveryRetryKeyBinding(retry: RecoveryRetryRecord, commandId: string, sourceFingerprint: string): void {
  if (retry.retryKey !== createRecoveryRetryKey(commandId, sourceFingerprint)) throw new Error("Recovery retry key/fingerprint binding mismatch.");
  if (retry.sourceFingerprint !== sourceFingerprint) throw new Error("Recovery retry source fingerprint mismatch.");
}

export function assertOutboxRetryBinding(event: OutboxEvent, retry: RecoveryRetryRecord): void {
  if (event.eventId !== retry.targetId && event.aggregateId !== retry.targetId) throw new Error("Outbox retry target binding mismatch.");
  if (!event.payloadFingerprint.trim() || event.payloadFingerprint !== retry.sourceFingerprint) throw new Error("Outbox retry fingerprint mismatch.");
}

export function assertProjectionRetryBinding(snapshot: ReportingSnapshot, retry: RecoveryRetryRecord): void {
  if (snapshot.snapshotId !== retry.targetId && snapshot.sourceRevision !== retry.targetId) throw new Error("Projection retry target binding mismatch.");
  if (!retry.sourceFingerprint.trim()) throw new Error("Projection retry fingerprint is required.");
}
