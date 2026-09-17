import test from "node:test";
import assert from "node:assert/strict";
import { executeCriticalMutation, type MutationIntegrationStores } from "../src/application/mutation-integration.js";
import { assertObservabilityContextContinuity, emitObservabilityEvent, type ObservabilityEvent, type ObservabilitySink } from "../src/application/observability-contract.js";
import type { IdempotencyRecord } from "../src/application/idempotency-contract.js";
import type { OutboxEventContract } from "../src/application/outbox-runtime-contract.js";
import type { ExecutionContext } from "../src/application/execution-context-contract.js";
import type { TransactionContext, TransactionRunner } from "../src/application/transaction-contract.js";

const canonicalContext: ExecutionContext = Object.freeze({
  requestId: "req-e2e-001",
  correlationId: "corr-e2e-001",
  transactionId: "tx-e2e-001",
  idempotencyKey: "idem-e2e-001",
});

type Evidence = {
  transaction?: TransactionContext;
  auditContext?: ExecutionContext;
  outboxContext?: ExecutionContext;
  observability?: ObservabilityEvent;
};

function createHarness(): {
  stores: MutationIntegrationStores;
  evidence: Evidence & { audits: unknown[]; outbox: OutboxEventContract[]; idempotency: Map<string, IdempotencyRecord> };
  runner: TransactionRunner;
  sink: ObservabilitySink;
} {
  const idempotency = new Map<string, IdempotencyRecord>();
  const audits: unknown[] = [];
  const outbox: OutboxEventContract[] = [];
  const evidence: Evidence & { audits: unknown[]; outbox: OutboxEventContract[]; idempotency: Map<string, IdempotencyRecord> } = { audits, outbox, idempotency };

  const stores: MutationIntegrationStores = {
    findIdempotency: key => idempotency.get(key),
    saveIdempotency: record => idempotency.set(record.idempotencyKey, record),
    appendAudit: record => {
      assert.deepEqual(record.executionContext, canonicalContext);
      audits.push(record);
      evidence.auditContext = record.executionContext;
    },
    appendPending: async event => {
      assert.deepEqual(event.executionContext, canonicalContext);
      if (outbox.some(existing => existing.eventId === event.eventId)) return "CONFLICT";
      outbox.push(event);
      evidence.outboxContext = event.executionContext;
      return "ADMIT";
    },
  };

  const runner: TransactionRunner = async (context, work) => {
    assert.deepEqual(context, canonicalContext);
    evidence.transaction = context;
    return work();
  };

  const sink: ObservabilitySink = { emit: async event => { evidence.observability = event; } };
  return { stores, evidence, runner, sink };
}

function mutationInput() {
  return {
    context: canonicalContext,
    commandType: "DETAINEE_REGISTER",
    aggregateId: "synthetic-d-001",
    requestHash: "synthetic-request-hash-001",
    auditId: "synthetic-audit-001",
    eventId: "synthetic-event-001",
    occurredAt: "2026-09-16T00:00:00.000Z",
    payload: { source: "synthetic", action: "register" },
    payloadFingerprint: "synthetic-payload-fp-001",
    responseFingerprint: "synthetic-response-fp-001",
    runDomainMutation: async () => ({ ok: true }),
  };
}

test("synthetic E2E harness observes the canonical context through transaction, audit and outbox", async () => {
  const harness = createHarness();
  const result = await executeCriticalMutation(mutationInput(), harness.stores, harness.runner);
  await emitObservabilityEvent(harness.sink, {
    eventId: "synthetic-observation-001",
    eventType: "CRITICAL_MUTATION_COMPLETED",
    level: "INFO",
    timestamp: "2026-09-16T00:00:00.000Z",
    correlationId: canonicalContext.correlationId,
    requestId: canonicalContext.requestId,
    transactionId: canonicalContext.transactionId,
    outcome: "SUCCEEDED",
  });

  assert.equal(result.outcome, "COMMITTED");
  assert.deepEqual(harness.evidence.transaction, canonicalContext);
  assert.deepEqual(harness.evidence.auditContext, canonicalContext);
  assert.deepEqual(harness.evidence.outboxContext, canonicalContext);
  assert.deepEqual(harness.evidence.outbox[0]?.executionContext, canonicalContext);
  assert.deepEqual((harness.evidence.audits[0] as { executionContext: ExecutionContext }).executionContext, canonicalContext);
  assert.equal(harness.evidence.observability?.requestId, canonicalContext.requestId);
  assert.equal(harness.evidence.observability?.correlationId, canonicalContext.correlationId);
  assert.equal(harness.evidence.observability?.transactionId, canonicalContext.transactionId);
  assert.equal(harness.evidence.audits.length, 1);
  assert.equal(harness.evidence.outbox.length, 1);
});

test("synthetic E2E harness rejects observability identity drift", () => {
  assert.throws(
    () => assertObservabilityContextContinuity(canonicalContext, {
      requestId: canonicalContext.requestId,
      correlationId: "wrong-correlation",
      transactionId: canonicalContext.transactionId,
    }),
    /EXECUTION_CONTEXT_MISMATCH:correlationId/,
  );
});

test("synthetic E2E harness does not claim downstream evidence when mutation fails", async () => {
  const harness = createHarness();
  await assert.rejects(
    () => executeCriticalMutation({ ...mutationInput(), runDomainMutation: async () => { throw new Error("DOMAIN_FAILURE"); } }, harness.stores, harness.runner),
    /DOMAIN_FAILURE/,
  );
  assert.equal(harness.evidence.auditContext, undefined);
  assert.equal(harness.evidence.outboxContext, undefined);
  assert.equal(harness.evidence.observability, undefined);
});
