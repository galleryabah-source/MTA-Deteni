import assert from "node:assert/strict";
import test from "node:test";
import {
  OUTBOX_CONTRACT_VERSION,
  nextOutboxStatus,
  validateOutboxEvent,
} from "../src/infrastructure/messaging/outbox-contract";

const event = {
  eventId: "evt-001",
  aggregateType: "DETAINEE",
  aggregateId: "det-001",
  eventType: "DETAINEE_UPDATED",
  payloadHash: "a".repeat(64),
  occurredAt: "2026-09-21T00:00:00.000Z",
  status: "PENDING" as const,
  attemptCount: 0,
};

test("P9.8 exposes a versioned outbox contract", () => {
  assert.equal(OUTBOX_CONTRACT_VERSION, "P9.8-v1");
});

test("valid outbox event passes validation", () => {
  assert.doesNotThrow(() => validateOutboxEvent(event));
});

test("missing event identity is rejected", () => {
  assert.throws(
    () => validateOutboxEvent({ ...event, eventId: "" }),
    /OUTBOX_EVENTID_REQUIRED/,
  );
});

test("negative attempt count is rejected", () => {
  assert.throws(
    () => validateOutboxEvent({ ...event, attemptCount: -1 }),
    /OUTBOX_ATTEMPT_COUNT_INVALID/,
  );
});

test("successful delivery is dispatched and failed delivery remains retryable", () => {
  assert.equal(nextOutboxStatus("PENDING", true), "DISPATCHED");
  assert.equal(nextOutboxStatus("PENDING", false), "FAILED");
  assert.equal(nextOutboxStatus("DISPATCHED", false), "DISPATCHED");
});
