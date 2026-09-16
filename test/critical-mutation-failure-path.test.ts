import test from "node:test";
import assert from "node:assert/strict";
import { executeCriticalMutation, type MutationIntegrationStores } from "../src/application/mutation-integration.js";
import type { IdempotencyRecord } from "../src/application/idempotency-contract.js";
import type { OutboxEventContract } from "../src/application/outbox-runtime-contract.js";
import type { TransactionContext, TransactionRunner } from "../src/application/transaction-contract.js";

function context(): TransactionContext {
  return { transactionId: "tx-001", requestId: "req-001", correlationId: "corr-001", idempotencyKey: "idem-001" };
}

type StoreHarness = MutationIntegrationStores & {
  audits: unknown[];
  outbox: OutboxEventContract[];
  idempotency: Map<string, IdempotencyRecord>;
};

function stores(seed?: IdempotencyRecord): StoreHarness {
  const idempotency = new Map<string, IdempotencyRecord>();
  if (seed) idempotency.set(seed.idempotencyKey, seed);
  const audits: unknown[] = [];
  const outbox: OutboxEventContract[] = [];
  return {
    idempotency,
    audits,
    outbox,
    findIdempotency: key => idempotency.get(key),
    saveIdempotency: record => idempotency.set(record.idempotencyKey, record),
    appendAudit: record => audits.push(record),
    appendOutbox: async event => {
      if (outbox.some(existing => existing.eventId === event.eventId)) return "CONFLICT";
      outbox.push(event);
      return "ADMIT";
    },
  };
}

function transactionalRunner(harness: StoreHarness): TransactionRunner {
  return async (_ctx, work) => {
    const idempotencySnapshot = new Map(harness.idempotency);
    const auditsSnapshot = [...harness.audits];
    const outboxSnapshot = [...harness.outbox];
    try {
      return await work();
    } catch (error) {
      harness.idempotency.clear();
      for (const [key, value] of idempotencySnapshot) harness.idempotency.set(key, value);
      harness.audits.splice(0, harness.audits.length, ...auditsSnapshot);
      harness.outbox.splice(0, harness.outbox.length, ...outboxSnapshot);
      throw error;
    }
  };
}

function input(overrides: Partial<{
  requestHash: string;
  eventId: string;
  payloadFingerprint: string;
  responseFingerprint: string;
  runDomainMutation: () => Promise<unknown>;
}> = {}) {
  return {
    context: context(),
    commandType: "DETAINEE_REGISTER",
    aggregateId: "d-001",
    requestHash: "request-hash-1",
    auditId: "audit-001",
    eventId: "event-001",
    occurredAt: "2026-09-16T00:00:00.000Z",
    payload: { source: "synthetic", action: "register" },
    payloadFingerprint: "payload-fp-1",
    responseFingerprint: "response-fp-1",
    runDomainMutation: async () => ({ ok: true }),
    ...overrides,
  };
}

async function execute(harness: StoreHarness, overrides: Parameters<typeof input>[0] = {}) {
  return executeCriticalMutation(input(overrides), harness, transactionalRunner(harness));
}

test("duplicate completed request replays without side effects", async () => {
  const harness = storesWithCompleted();
  const result = await execute(harness);
  assert.equal(result.outcome, "REPLAYED");
  assert.equal(harness.audits.length, 0);
  assert.equal(harness.outbox.length, 0);
});

test("same idempotency key with different request fails closed", async () => {
  const harness = storesWithCompleted();
  await assert.rejects(() => execute(harness, { requestHash: "different" }), /IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST/);
  assert.equal(harness.audits.length, 0);
  assert.equal(harness.outbox.length, 0);
});

test("domain failure rolls back idempotency and downstream evidence", async () => {
  const harness = stores();
  await assert.rejects(() => execute(harness, { runDomainMutation: async () => { throw new Error("DOMAIN_FAILURE"); } }), /DOMAIN_FAILURE/);
  assert.equal(harness.idempotency.size, 0);
  assert.equal(harness.audits.length, 0);
  assert.equal(harness.outbox.length, 0);
});

test("audit failure rolls back completed mutation state and prevents outbox", async () => {
  const harness = stores();
  harness.appendAudit = () => { throw new Error("AUDIT_FAILURE"); };
  await assert.rejects(() => execute(harness), /AUDIT_FAILURE/);
  assert.equal(harness.idempotency.size, 0);
  assert.equal(harness.audits.length, 0);
  assert.equal(harness.outbox.length, 0);
});

test("outbox conflict rolls back idempotency and audit state", async () => {
  const harness = stores();
  harness.outbox.push({
    eventId: "event-001",
    aggregateType: "DETAINEE_REGISTER",
    aggregateId: "d-001",
    eventType: "DETAINEE_REGISTER_COMMITTED",
    payload: { source: "synthetic", action: "existing" },
    payloadFingerprint: "existing-fp",
    occurredAt: "2026-09-16T00:00:00.000Z",
    status: "PENDING",
    attemptCount: 0,
  });
  await assert.rejects(() => execute(harness), /OUTBOX_EVENT_ID_CONFLICT/);
  assert.equal(harness.idempotency.size, 0);
  assert.equal(harness.audits.length, 0);
  assert.equal(harness.outbox.length, 1);
});

function storesWithCompleted(): StoreHarness {
  return stores({
    idempotencyKey: "idem-001",
    commandType: "DETAINEE_REGISTER",
    requestHash: "request-hash-1",
    status: "COMPLETED",
    responseFingerprint: "response-fp-1",
    createdAt: "2026-09-16T00:00:00.000Z",
    completedAt: "2026-09-16T00:00:00.000Z",
  });
}
