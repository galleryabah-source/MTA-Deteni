import test from "node:test";
import assert from "node:assert/strict";
import { createOutboxEvent } from "../src/application/outbox-runtime-contract.ts";
import { OutboxReadModelProjector, projectOutboxBatch } from "../src/application/p12-321-344-outbox-read-model-projector.ts";

const executionContext = Object.freeze({
  requestId: "req-p99-projector",
  correlationId: "corr-p99-projector",
  transactionId: "tx-p99-projector",
  idempotencyKey: "idem-p99-projector",
});

const event = createOutboxEvent({
  eventId: "event-p99-projector",
  eventType: "DETAINEE_UPDATED",
  aggregateType: "DETAINEE",
  aggregateId: "DET-SYN-PROJECTOR-001",
  payload: { synthetic: true },
  idempotencyKey: executionContext.idempotencyKey,
  occurredAt: "2026-09-30T00:00:00.000Z",
  executionContext,
  payloadFingerprint: "fp-p99-projector",
});

test("P9.9 projection consumes the canonical outbox event without legacy OutboxMessage vocabulary", async () => {
  let received;
  const projector = new OutboxReadModelProjector({
    project: async (candidate) => {
      received = candidate;
      return { accepted: true };
    },
  });

  const result = await projector.project(event);

  assert.equal(result.eventId, event.eventId);
  assert.equal(result.aggregateId, event.aggregateId);
  assert.equal(result.projected, true);
  assert.equal(received?.eventId, event.eventId);
  assert.equal(received?.executionContext.correlationId, executionContext.correlationId);
  assert.equal(received?.payloadFingerprint, event.payloadFingerprint);
});

test("P9.9 projection batch preserves canonical event identity", async () => {
  const projector = new OutboxReadModelProjector({
    project: async () => undefined,
  });

  const results = await projectOutboxBatch([event], projector);

  assert.deepEqual(results, [{
    eventId: event.eventId,
    aggregateId: event.aggregateId,
    projected: true,
  }]);
});

test("P9.9 projection rejects missing canonical aggregate identity", async () => {
  const invalid = { ...event, aggregateId: undefined };

  const projector = new OutboxReadModelProjector({
    project: async () => undefined,
  });

  await assert.rejects(
    () => projector.project(invalid),
    /CANONICAL_OUTBOX_IDENTITY_REQUIRED/,
  );
});
