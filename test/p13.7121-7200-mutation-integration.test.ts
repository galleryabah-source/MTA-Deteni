import test from "node:test";
import assert from "node:assert/strict";
import { executeCriticalMutation, type MutationAuditRecord, type MutationIntegrationStores } from "../src/application/mutation-integration.js";
import type { IdempotencyRecord } from "../src/application/idempotency-contract.js";
import type { OutboxEventContract } from "../src/application/outbox-runtime-contract.js";
import type { TransactionRunner } from "../src/application/transaction-contract.js";

function harness(existing?: IdempotencyRecord) {
  let idempotency = existing;
  const audit: MutationAuditRecord[] = [];
  const outbox: OutboxEventContract[] = [];
  const stores: MutationIntegrationStores = {
    findIdempotency: () => idempotency,
    saveIdempotency: (record) => { idempotency = record; },
    appendAudit: (record) => { audit.push(record); },
    appendPending: async (event) => { outbox.push(event); return "ADMIT"; },
  };
  return { stores, audit, outbox, getIdempotency: () => idempotency };
}

const base = {
  context: { transactionId: "tx-7121", requestId: "req-7121", correlationId: "corr-7121", idempotencyKey: "idem-7121" },
  commandType: "TEMPORARY_EXIT_APPROVE",
  aggregateId: "exit-7121",
  requestHash: "request-hash-a",
  auditId: "audit-7121",
  eventId: "event-7121",
  occurredAt: "2026-09-15T00:00:00Z",
  payload: { status: "APPROVED" },
  payloadFingerprint: "payload-fp-a",
  responseFingerprint: "response-fp-a",
};

const runner: TransactionRunner = async (_context, work) => work();

test("P13.7121-7160 mutation seam commits domain, audit and outbox under one transaction runner", async () => {
  const h = harness();
  let domainCalls = 0;
  const result = await executeCriticalMutation({ ...base, runDomainMutation: async () => { domainCalls += 1; return "APPROVED"; } }, h.stores, runner);
  assert.equal(result.outcome, "COMMITTED");
  assert.equal(result.value, "APPROVED");
  assert.equal(domainCalls, 1);
  assert.equal(h.getIdempotency()?.status, "COMPLETED");
  assert.equal(h.audit.length, 1);
  assert.equal(h.outbox.length, 1);
  assert.equal(h.outbox[0]?.eventType, "TEMPORARY_EXIT_APPROVE_COMMITTED");
});

test("P13.7161-7180 completed idempotency key replays without domain mutation", async () => {
  const existing: IdempotencyRecord = { idempotencyKey: "idem-7121", commandType: base.commandType, requestHash: base.requestHash, status: "COMPLETED", responseFingerprint: base.responseFingerprint, createdAt: base.occurredAt, completedAt: base.occurredAt };
  const h = harness(existing);
  let domainCalls = 0;
  const result = await executeCriticalMutation({ ...base, runDomainMutation: async () => { domainCalls += 1; return "MUST-NOT-RUN"; } }, h.stores, runner);
  assert.equal(result.outcome, "REPLAYED");
  assert.equal(domainCalls, 0);
  assert.equal(h.audit.length, 0);
  assert.equal(h.outbox.length, 0);
});

test("P13.7181-7200 reused key with a different request is fail-closed", async () => {
  const existing: IdempotencyRecord = { idempotencyKey: "idem-7121", commandType: base.commandType, requestHash: "different-hash", status: "COMPLETED", createdAt: base.occurredAt };
  const h = harness(existing);
  await assert.rejects(() => executeCriticalMutation({ ...base, runDomainMutation: async () => "MUST-NOT-RUN" }, h.stores, runner), /IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST/);
});
