import assert from "node:assert/strict";
import test from "node:test";
import { validatePersistenceOperationContext } from "../src/infrastructure/persistence/p12-521-560-persistence-repository-contract.js";
import { buildIdempotencyObservation } from "../src/application/p12-561-600-idempotency-observability.js";
import { nextCheckpoint } from "../src/application/p12-601-680-projection-checkpoint-retry.js";

const context = { transactionId: "TX-SYN-1", actorId: "ACT-SYN-1", correlationId: "CORR-SYN-1" };
const event = { eventId: "EVT-SYN-1", eventType: "detainee.updated", aggregateType: "detainee", aggregateId: "DET-SYN-1", payload: {}, idempotencyKey: "IDEMP-SYN-1", occurredAt: "2026-09-15T00:00:00Z", executionContext: { requestId: "REQ-SYN-1", correlationId: "CORR-SYN-1", transactionId: "TX-SYN-1", idempotencyKey: "IDEMP-SYN-1" }, payloadFingerprint: "FP-SYN-1", status: "PENDING", attempts: 0, availableAt: "2026-09-15T00:00:00Z", createdAt: "2026-09-15T00:00:00Z" } as const;

test("P12.521-560 requires complete persistence context", () => {
  assert.equal(validatePersistenceOperationContext(context), "READY");
  assert.equal(validatePersistenceOperationContext({ ...context, actorId: "" }), "BLOCKED");
});

test("P12.561-600 binds idempotency observation to operation identity", () => {
  const observation = buildIdempotencyObservation({ key: "IDEMP-SYN-1", fingerprint: "FP", actorId: "ACT-SYN-1", correlationId: "CORR-SYN-1", aggregateId: "DET-SYN-1", state: "COMPLETED", result: { ok: true } }, "COMPLETED", "2026-09-15T00:00:00Z");
  assert.equal(observation.aggregateId, "DET-SYN-1");
});

test("P12.601-680 produces deterministic canonical projection checkpoints", () => {
  assert.deepEqual(nextCheckpoint("PROJ-SYN", event, "2026-09-15T00:00:00Z"), { projectorId: "PROJ-SYN", lastEventId: "EVT-SYN-1", lastAggregateId: "DET-SYN-1", updatedAt: "2026-09-15T00:00:00Z" });
});
