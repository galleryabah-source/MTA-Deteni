import assert from "node:assert/strict";
import test from "node:test";
import { createExecutionContext } from "../src/application/execution-context-contract.js";
import { certifyObservabilityTrace } from "../src/application/observability-certification.js";

const context = createExecutionContext({
  requestId: "REQ-OBS-1",
  correlationId: "CORR-OBS-1",
  transactionId: "TX-OBS-1",
  idempotencyKey: "IDEM-OBS-1",
});

const stages = ["SCAN","RESOLVE","AUTHORIZATION","ACTION","MUTATION","IDEMPOTENCY","AUDIT","OUTBOX","EVIDENCE","REPORT","DOCUMENT","RECOVERY"] as const;

function trace(overrides: Record<string, unknown> = {}) {
  return stages.map((stage, index) => ({
    stage,
    event: {
      eventId: "OBS-" + index,
      eventType: "MTA_" + stage,
      level: "INFO" as const,
      timestamp: "2026-09-26T00:00:00.000Z",
      correlationId: context.correlationId,
      requestId: context.requestId,
      transactionId: context.transactionId,
      outcome: index === stages.length - 1 ? "SUCCEEDED" as const : "STARTED" as const,
      metadata: { source: "SYNTHETIC" },
      ...(index === 0 ? overrides : {}),
    },
  }));
}

test("observability certifies one correlation across the complete operational chain", () => {
  const result = certifyObservabilityTrace({ context, trace: trace() });
  assert.equal(result.certified, true);
  assert.equal(result.eventCount, 12);
  assert.deepEqual(result.stages, stages);
});

test("observability rejects correlation drift", () => {
  const events = trace();
  events[6] = { ...events[6], event: { ...events[6].event, correlationId: "CORR-DRIFT" } };
  assert.throws(() => certifyObservabilityTrace({ context, trace: events }), /EXECUTION_CONTEXT_MISMATCH:correlationId/);
});

test("observability rejects stage order drift and duplicate event ids", () => {
  const reordered = trace();
  reordered[0] = { ...reordered[0], stage: "RESOLVE" };
  assert.throws(() => certifyObservabilityTrace({ context, trace: reordered }), /OBSERVABILITY_STAGE_ORDER_DRIFT/);
  const duplicate = trace();
  duplicate[1] = { ...duplicate[1], event: { ...duplicate[1].event, eventId: duplicate[0].event.eventId } };
  assert.throws(() => certifyObservabilityTrace({ context, trace: duplicate }), /OBSERVABILITY_DUPLICATE_EVENT/);
});

test("observability blocks sensitive metadata from logs", () => {
  const events = trace();
  events[3] = { ...events[3], event: { ...events[3].event, metadata: { source: "SYNTHETIC", token: "SECRET" } } };
  assert.throws(() => certifyObservabilityTrace({ context, trace: events }), /OBSERVABILITY_SENSITIVE_METADATA_BLOCKED/);
});
