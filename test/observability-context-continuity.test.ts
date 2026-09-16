import test from "node:test";
import assert from "node:assert/strict";
import { createExecutionContext } from "../src/application/execution-context-contract.js";
import { assertObservabilityContextContinuity } from "../src/application/observability-contract.js";

const context = createExecutionContext({
  requestId: "req-001",
  correlationId: "corr-001",
  transactionId: "tx-001",
  idempotencyKey: "idem-001",
});

test("observability accepts identities from the canonical execution context", () => {
  assert.doesNotThrow(() => assertObservabilityContextContinuity(context, {
    requestId: "req-001",
    correlationId: "corr-001",
    transactionId: "tx-001",
  }));
});

test("observability rejects request identity drift", () => {
  assert.throws(() => assertObservabilityContextContinuity(context, {
    requestId: "req-drift",
    correlationId: "corr-001",
    transactionId: "tx-001",
  }), /EXECUTION_CONTEXT_MISMATCH:requestId/);
});

test("observability rejects transaction identity drift", () => {
  assert.throws(() => assertObservabilityContextContinuity(context, {
    requestId: "req-001",
    correlationId: "corr-001",
    transactionId: "tx-drift",
  }), /EXECUTION_CONTEXT_MISMATCH:transactionId/);
});

test("observability can omit transaction identity only for non-transactional events", () => {
  assert.doesNotThrow(() => assertObservabilityContextContinuity(context, {
    requestId: "req-001",
    correlationId: "corr-001",
  }));
});
