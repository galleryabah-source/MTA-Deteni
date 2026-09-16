import test from "node:test";
import assert from "node:assert/strict";
import { executeCriticalMutation, type MutationIntegrationStores } from "../src/application/mutation-integration.js";
import type { IdempotencyRecord } from "../src/application/idempotency-contract.js";
import type { OutboxEvent } from "../src/application/outbox-contract.js";
import type { TransactionContext, TransactionRunner } from "../src/application/transaction-contract.js";

function context(): TransactionContext {
  return { transactionId: "tx-001", requestId: "req-001", correlationId: "corr-001", idempotencyKey: "idem-001" };
}

function stores(seed?: IdempotencyRecord): MutationIntegrationStores & { audits: unknown[]; outbox: OutboxEvent[]; idempotency: Map<string, IdempotencyRecord> } {
  const idempotency = new Map<string, IdempotencyRecord>();
  if (seed) idempotency.set(seed.idempotencyKey, seed);
  const audits: unknown[] = [];
  const outbox: OutboxEvent[] = [];
  return {
    idempotency,
    audits,
    outbox,
    findIdempotency: key => idempotency.get(key),
    saveIdempotency: record => idempotency.set(record.idempotencyKey, record),
    appendAudit: record => audits.push(record),
    appendOutbox: event => outbox.push(event),
  };
}

function runner(): TransactionRunner {
  return async (_ctx, work) => work();
}

function input(overrides: Partial<Parameters<typeof executeCriticalMutation>[0]> = {}) {
  return {
    context: context(),
    commandType: "DETAINEE_REGISTER",
    aggregateId: "d-001",
    requestHash: "request-hash-1",
    auditId: "audit-001",
    eventId: "event-001",
    occurredAt: "2026-09-16T00:00:00.000Z",
    payload: "synthetic",
    payloadFingerprint: "payload-fp-1",
    responseFingerprint: "response-fp-1",
    runDomainMutation: async () => ({ ok: true }),
    ...overrides,
  };
}

test("duplicate completed request replays without side effects", async () => {
  const stores = storesWithCompleted();
  const result = await executeCriticalMutation(input(), stores, runner());
  assert.equal(result.outcome, "REPLAYED");
  assert.equal(stores.audits.length, 0);
  assert.equal(stores.outbox.length, 0);
});

test("same idempotency key with different request fails closed", async () => {
  const stores = storesWithCompleted();
  await assert.rejects(() => executeCriticalMutation(input({ requestHash: "different" }), stores, runner()), /IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST/);
});

test("domain failure prevents audit and outbox completion", async () => {
  const stores = stores();
  await assert.rejects(() => executeCriticalMutation(input({ runDomainMutation: async () => { throw new Error("DOMAIN_FAILURE"); } }), stores, runner()), /DOMAIN_FAILURE/);
  assert.equal(stores.audits.length, 0);
  assert.equal(stores.outbox.length, 0);
  assert.equal(stores.idempotency.get("idem-001")?.status, "IN_PROGRESS");
});

test("audit failure prevents outbox append", async () => {
  const stores = stores();
  stores.appendAudit = () => { throw new Error("AUDIT_FAILURE"); };
  await assert.rejects(() => executeCriticalMutation(input(), stores, runner()), /AUDIT_FAILURE/);
  assert.equal(stores.outbox.length, 0);
});

test("outbox failure is observable after audit and completion", async () => {
  const stores = stores();
  stores.appendOutbox = () => { throw new Error("OUTBOX_FAILURE"); };
  await assert.rejects(() => executeCriticalMutation(input(), stores, runner()), /OUTBOX_FAILURE/);
  assert.equal(stores.audits.length, 1);
  assert.equal(stores.idempotency.get("idem-001")?.status, "COMPLETED");
});

function storesWithCompleted() {
  return stores({ idempotencyKey: "idem-001", commandType: "DETAINEE_REGISTER", requestHash: "request-hash-1", status: "COMPLETED", responseFingerprint: "response-fp-1", createdAt: "2026-09-16T00:00:00.000Z", completedAt: "2026-09-16T00:00:00.000Z" });
}
