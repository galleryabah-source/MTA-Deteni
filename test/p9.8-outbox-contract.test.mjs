import test from "node:test";
import assert from "node:assert/strict";
import { validateOutboxEnqueue } from "../src/application/outbox-contract.ts";

const valid = () => ({
  eventId: "00000000-0000-0000-0000-000000000001",
  eventType: "DETAINEE_INSERT",
  aggregateType: "DETAINEE",
  aggregateId: "DET-TEST-001",
  payload: { synthetic: true },
  idempotencyKey: "p98-test-0001",
  occurredAt: "2026-09-23T00:00:00.000Z",
});

test("P9.8 validates a canonical outbox enqueue command", () => {
  assert.doesNotThrow(() => validateOutboxEnqueue(valid()));
});

for (const [field, code] of [
  ["eventId", "OUTBOX_EVENT_ID_REQUIRED"],
  ["eventType", "OUTBOX_EVENT_TYPE_REQUIRED"],
  ["aggregateType", "OUTBOX_AGGREGATE_TYPE_REQUIRED"],
  ["idempotencyKey", "OUTBOX_IDEMPOTENCY_KEY_REQUIRED"],
  ["occurredAt", "OUTBOX_OCCURRED_AT_REQUIRED"],
]) {
  test(`P9.8 rejects missing ${field}`, () => {
    const command = valid();
    command[field] = "";
    assert.throws(() => validateOutboxEnqueue(command), new RegExp(code));
  });
}

test("P9.8 rejects array payloads", () => {
  const command = valid();
  command.payload = [];
  assert.throws(() => validateOutboxEnqueue(command), /OUTBOX_PAYLOAD_OBJECT_REQUIRED/);
});
