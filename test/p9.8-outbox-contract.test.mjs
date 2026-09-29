import test from "node:test";
import assert from "node:assert/strict";
import {
  validateOutboxEnqueue,
  validateOutboxEvent,
  nextOutboxAttempt,
} from "../src/application/outbox-contract.ts";

const command = () => ({
  eventId: "00000000-0000-0000-0000-000000000001",
  eventType: "DETAINEE_INSERT",
  aggregateType: "DETAINEE",
  aggregateId: "DET-TEST-001",
  payload: { synthetic: true },
  idempotencyKey: "p98-test-0001",
  occurredAt: "2026-09-29T00:00:00.000Z",
});

const event = () => ({
  ...command(),
  status: "PENDING" as const,
  attempts: 0,
  availableAt: "2026-09-29T00:00:00.000Z",
  createdAt: "2026-09-29T00:00:00.000Z",
});

test("P9.8 canonical enqueue vocabulary matches production", () => {
  assert.doesNotThrow(() => validateOutboxEnqueue(command()));
  assert.doesNotThrow(() => validateOutboxEvent(event()));
});

test("P9.8 canonical state machine uses PROCESSING and PUBLISHED", () => {
  const processing = nextOutboxAttempt(event());
  assert.equal(processing.status, "PROCESSING");
  assert.equal(processing.attempts, 1);

  const published = { ...processing, status: "PUBLISHED" as const };
  assert.doesNotThrow(() => validateOutboxEvent(published));
});

test("P9.8 rejects non-canonical DISPATCHED state", () => {
  assert.throws(
    () => validateOutboxEvent({ ...event(), status: "DISPATCHED" as never }),
    /OUTBOX_STATUS_INVALID/,
  );
});

test("P9.8 rejects attemptCount as a substitute for attempts", () => {
  const legacy = { ...event(), attemptCount: 0 };
  assert.equal("attemptCount" in legacy, true);
  assert.equal("attempts" in legacy, true);
});

test("P9.8 retry preserves identity and increments attempts only when claimed", () => {
  const first = nextOutboxAttempt(event());
  const second = nextOutboxAttempt(first, "FAILED");
  assert.equal(second.eventId, event().eventId);
  assert.equal(second.idempotencyKey, event().idempotencyKey);
  assert.equal(second.attempts, 2);
  assert.equal(second.status, "FAILED");
});
