import test from "node:test";
import assert from "node:assert/strict";
import {
  assertCriticalMutationContextContinuity,
  establishCriticalMutationContext,
} from "../src/application/critical-mutation-context-contract.js";

function baseContext() {
  return {
    requestId: " req-001 ",
    correlationId: "corr-001",
    transactionId: "tx-001",
    idempotencyKey: "idem-001",
  };
}

test("critical mutation context is normalized once and immutable", () => {
  const context = establishCriticalMutationContext(baseContext());
  assert.deepEqual(context, {
    requestId: "req-001",
    correlationId: "corr-001",
    transactionId: "tx-001",
    idempotencyKey: "idem-001",
  });
  assert.equal(Object.isFrozen(context), true);
});

test("transaction and observability identities must remain continuous", () => {
  const context = establishCriticalMutationContext(baseContext());

  assert.doesNotThrow(() => assertCriticalMutationContextContinuity(context, {
    transaction: context,
    observability: {
      requestId: context.requestId,
      correlationId: context.correlationId,
      transactionId: context.transactionId,
    },
  }));
});

test("transaction identity drift fails closed", () => {
  const context = establishCriticalMutationContext(baseContext());

  assert.throws(() => assertCriticalMutationContextContinuity(context, {
    transaction: { ...context, transactionId: "tx-drift" },
  }), /EXECUTION_CONTEXT_MISMATCH:transactionId/);
});

test("observability correlation drift fails closed", () => {
  const context = establishCriticalMutationContext(baseContext());

  assert.throws(() => assertCriticalMutationContextContinuity(context, {
    observability: {
      requestId: context.requestId,
      correlationId: "corr-drift",
      transactionId: context.transactionId,
    },
  }), /EXECUTION_CONTEXT_MISMATCH:correlationId/);
});

test("idempotency drift fails closed at transaction downstream", () => {
  const context = establishCriticalMutationContext(baseContext());

  assert.throws(() => assertCriticalMutationContextContinuity(context, {
    transaction: { ...context, idempotencyKey: "idem-drift" },
  }), /EXECUTION_CONTEXT_MISMATCH:idempotencyKey/);
});
