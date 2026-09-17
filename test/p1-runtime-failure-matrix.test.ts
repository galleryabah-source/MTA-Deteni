import test from "node:test";
import assert from "node:assert/strict";
import { executeCriticalMutation, type MutationIntegrationStores } from "../src/application/mutation-integration.js";
import type { IdempotencyRecord } from "../src/application/idempotency-contract.js";
import type { OutboxEventContract } from "../src/application/outbox-runtime-contract.js";
import type { TransactionRunner } from "../src/application/transaction-contract.js";

const context = Object.freeze({
  requestId: "req-failure-001",
  correlationId: "corr-failure-001",
  transactionId: "tx-failure-001",
  idempotencyKey: "idem-failure-001",
});

function input(overrides: Partial<Parameters<typeof executeCriticalMutation>[0]> = {}) {
  return {
    context,
    commandType: "DETAINEE_UPDATE",
    aggregateId: "synthetic-d-001",
    requestHash: "request-hash-001",
    auditId: "audit-001",
    eventId: "event-001",
    occurredAt: "2026-09-16T00:00:00.000Z",
    payload: { synthetic: true },
    payloadFingerprint: "payload-fp-001",
    responseFingerprint: "response-fp-001",
    runDomainMutation: async () => ({ ok: true }),
    ...overrides,
  };
}

function harness(options: { auditError?: boolean; outboxDisposition?: "ADMIT" | "REPLAY" | "CONFLICT" } = {}) {
  const idempotency = new Map<string, IdempotencyRecord>();
  const audits: unknown[] = [];
  const outbox: OutboxEventContract[] = [];
  const stores: MutationIntegrationStores = {
    findIdempotency: key => idempotency.get(key),
    saveIdempotency: record => idempotency.set(record.idempotencyKey, record),
    appendAudit: record => {
      if (options.auditError) throw new Error("AUDIT_FAILURE");
      audits.push(record);
    },
    appendPending: async event => {
      if (options.outboxDisposition === "CONFLICT") return "CONFLICT";
      if (options.outboxDisposition === "REPLAY") return "REPLAY";
      outbox.push(event);
      return "ADMIT";
    },
  };
  const runner: TransactionRunner = async (_context, work) => work();
  return { stores, runner, idempotency, audits, outbox };
}

test("P1 failure matrix: missing context fails before mutation", async () => {
  const h = harness();
  await assert.rejects(
    () => executeCriticalMutation(input({ context: { ...context, requestId: "" } }), h.stores, h.runner),
    /REQUEST_ID_REQUIRED/,
  );
  assert.equal(h.audits.length, 0);
  assert.equal(h.outbox.length, 0);
});

test("P1 failure matrix: idempotency conflict blocks mutation", async () => {
  const h = harness();
  h.idempotency.set(context.idempotencyKey, Object.freeze({
    idempotencyKey: context.idempotencyKey,
    commandType: "DETAINEE_UPDATE",
    requestHash: "different-request-hash",
    status: "COMPLETED",
    responseFingerprint: "old-response",
    createdAt: "2026-09-16T00:00:00.000Z",
    completedAt: "2026-09-16T00:00:00.000Z",
  }));
  await assert.rejects(() => executeCriticalMutation(input(), h.stores, h.runner), /IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST/);
  assert.equal(h.audits.length, 0);
  assert.equal(h.outbox.length, 0);
});

test("P1 failure matrix: completed idempotency record replays without mutation", async () => {
  const h = harness();
  h.idempotency.set(context.idempotencyKey, Object.freeze({
    idempotencyKey: context.idempotencyKey,
    commandType: "DETAINEE_UPDATE",
    requestHash: "request-hash-001",
    status: "COMPLETED",
    responseFingerprint: "old-response",
    createdAt: "2026-09-16T00:00:00.000Z",
    completedAt: "2026-09-16T00:00:00.000Z",
  }));
  let mutations = 0;
  const result = await executeCriticalMutation(input({ runDomainMutation: async () => { mutations += 1; return { ok: true }; } }), h.stores, h.runner);
  assert.equal(result.outcome, "REPLAYED");
  assert.equal(mutations, 0);
  assert.equal(h.audits.length, 0);
  assert.equal(h.outbox.length, 0);
});

test("P1 failure matrix: domain failure emits no downstream evidence", async () => {
  const h = harness();
  await assert.rejects(
    () => executeCriticalMutation(input({ runDomainMutation: async () => { throw new Error("DOMAIN_FAILURE"); } }), h.stores, h.runner),
    /DOMAIN_FAILURE/,
  );
  assert.equal(h.audits.length, 0);
  assert.equal(h.outbox.length, 0);
});

test("P1 failure matrix: audit failure prevents outbox admission", async () => {
  const h = harness({ auditError: true });
  await assert.rejects(() => executeCriticalMutation(input(), h.stores, h.runner), /AUDIT_FAILURE/);
  assert.equal(h.outbox.length, 0);
});

test("P1 failure matrix: outbox conflict or replay fails closed", async () => {
  for (const disposition of ["CONFLICT", "REPLAY"] as const) {
    const h = harness({ outboxDisposition: disposition });
    await assert.rejects(
      () => executeCriticalMutation(input(), h.stores, h.runner),
      disposition === "CONFLICT" ? /OUTBOX_EVENT_ID_CONFLICT/ : /OUTBOX_EVENT_REPLAY_DURING_NEW_MUTATION/,
    );
  }
});
