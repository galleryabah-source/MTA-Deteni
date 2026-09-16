import test from "node:test";
import assert from "node:assert/strict";
import { appendMandatoryOutboxEvent, createOutboxEvent, validateOutboxEvent } from "../src/application/outbox-runtime-contract.js";

const input = {
  eventId: "evt-001",
  aggregateType: "DETAINEE",
  aggregateId: "det-001",
  eventType: "DETAINEE_UPDATED",
  payload: { synthetic: true },
  payloadFingerprint: "fp-001",
  occurredAt: "2026-09-16T00:00:00.000Z",
};

test("creates an immutable pending outbox event", () => {
  const event = createOutboxEvent(input);
  assert.equal(event.status, "PENDING");
  assert.equal(event.attemptCount, 0);
  assert.equal(Object.isFrozen(event), true);
});

test("rejects invalid outbox identity and non-pending append state", () => {
  assert.throws(() => validateOutboxEvent({ ...createOutboxEvent(input), eventId: "" }), /OUTBOX_IDENTITY_REQUIRED/);
  assert.throws(() => validateOutboxEvent({ ...createOutboxEvent(input), attemptCount: -1 }), /OUTBOX_ATTEMPT_COUNT_INVALID/);
  assert.throws(() => validateOutboxEvent({ ...createOutboxEvent(input), status: "DISPATCHED" }), /OUTBOX_APPEND_REQUIRES_PENDING/);
});

test("appends only through the mandatory pending boundary", async () => {
  const seen: string[] = [];
  const store = { appendPending: async (event: typeof createOutboxEvent(input)) => { seen.push(event.eventId); return "ADMIT" as const; } };
  const result = await appendMandatoryOutboxEvent(store, createOutboxEvent(input));
  assert.equal(result, "ADMIT");
  assert.deepEqual(seen, ["evt-001"]);
});
