import test from "node:test";
import assert from "node:assert/strict";
import { assertExecutionContextContinuity, createExecutionContext } from "../src/application/execution-context-contract.js";

const context = createExecutionContext({
  requestId: "req-001",
  correlationId: "corr-001",
  transactionId: "tx-001",
  idempotencyKey: "idem-001",
});

test("execution context normalizes and freezes canonical identities", () => {
  assert.equal(context.requestId, "req-001");
  assert.equal(context.correlationId, "corr-001");
  assert.equal(Object.isFrozen(context), true);
});

test("execution context accepts matching downstream identities", () => {
  assert.doesNotThrow(() => assertExecutionContextContinuity(context, {
    requestId: "req-001",
    correlationId: "corr-001",
    transactionId: "tx-001",
    idempotencyKey: "idem-001",
  }));
});

test("execution context rejects identity drift", () => {
  assert.throws(() => assertExecutionContextContinuity(context, { transactionId: "tx-002" }), /EXECUTION_CONTEXT_MISMATCH:transactionId/);
  assert.throws(() => assertExecutionContextContinuity(context, { correlationId: "corr-002" }), /EXECUTION_CONTEXT_MISMATCH:correlationId/);
});

test("execution context rejects missing canonical identities", () => {
  assert.throws(() => createExecutionContext({ ...context, requestId: " " }), /REQUEST_ID_REQUIRED/);
  assert.throws(() => createExecutionContext({ ...context, idempotencyKey: " " }), /IDEMPOTENCY_KEY_REQUIRED/);
});
