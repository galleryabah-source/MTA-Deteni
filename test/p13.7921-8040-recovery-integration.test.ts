import test from "node:test";
import assert from "node:assert/strict";
import { createRecoveryEvidence, assertRecoveryEventBinding } from "../src/application/recovery-evidence.js";
import { decideIdempotentRetry } from "../src/application/recovery-retry.js";
import { reconcileRepositoryQueueProjection, assertOfflineReconnectBoundToReconciliation } from "../src/application/reconciliation-contract.js";
import { enqueueOfflineCommand, reconcileOfflineCommand } from "../src/application/offline-continuity.js";
import { assertLifecycleEnvelope } from "../src/application/lifecycle-orchestration.js";

test("recovery evidence binds failure classification and version semantics", () => {
  const evidence = createRecoveryEvidence({
    evidenceId: "REC-E-001", commandId: "CMD-001", eventId: "EVT-001", correlationId: "CORR-001", aggregateId: "DET-001",
    expectedVersion: 4, resultingVersion: 4, failureClass: "STALE_VERSION", reasonCode: "VERSION_STALE",
    terminalState: "REVIEW_PENDING", recovery: "REVIEW_REQUIRED", mutationCommitted: false, retrySafe: false, compensationAllowed: false,
  });
  assertRecoveryEventBinding(evidence, "CMD-001", "EVT-001", "CORR-001", "DET-001");
  assert.throws(() => assertRecoveryEventBinding(evidence, "CMD-002", "EVT-001", "CORR-001", "DET-001"));
});

test("committed retry is idempotent while failure review remains explicit", () => {
  const first = decideIdempotentRetry({ retryKey: "OUTBOX:EVT-1", targetId: "EVT-1", sourceFingerprint: "FP-1", prior: [] });
  const duplicate = decideIdempotentRetry({ retryKey: "OUTBOX:EVT-1", targetId: "EVT-1", sourceFingerprint: "FP-1", prior: [first] });
  assert.equal(first.decision, "RETRY");
  assert.equal(duplicate.decision, "SKIP_DUPLICATE");
  const review = decideIdempotentRetry({ retryKey: "OUTBOX:EVT-2", targetId: "EVT-2", sourceFingerprint: "FP-2", prior: [], reviewRequired: true });
  assert.equal(review.decision, "REVIEW_REQUIRED");
});

test("offline reconnect conflict is bound to reconciliation conflict", () => {
  const command = enqueueOfflineCommand({ commandId: "CMD-OFF-1", aggregateId: "DET-001", commandType: "MOVEMENT_RECORD", payloadHash: "PH-1", idempotencyKey: "IDEM-1", createdAt: "2026-09-15T10:00:00Z" });
  const decision = reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: false });
  const result = reconcileRepositoryQueueProjection({ entity: { id: "DET-001", version: 2 }, command: { ...command, state: "CONFLICT" }, projection: { snapshotId: "SNAP-1", sourceRevision: "REV-1", generatedAt: "2026-09-15T10:00:00Z", rows: [] }, expectedProjectionSourceRevision: "REV-1" });
  assertOfflineReconnectBoundToReconciliation(decision, result);
  assert.equal(result.status, "CONFLICT");
});

test("lifecycle envelope rejects missing request hash", () => {
  assertLifecycleEnvelope({ commandId: "CMD-1", correlationId: "CORR-1", aggregateId: "DET-1", expectedVersion: 0, requestHash: "HASH-1", payload: {} });
  assert.throws(() => assertLifecycleEnvelope({ commandId: "CMD-1", correlationId: "CORR-1", aggregateId: "DET-1", expectedVersion: 0, requestHash: "", payload: {} }));
});
