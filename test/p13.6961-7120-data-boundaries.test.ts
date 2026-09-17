import test from "node:test";
import assert from "node:assert/strict";
import { assertMigrationFreeze, assertNoUnreviewedSchemaDrift, createSchemaContractMatrix, validateDatabaseConfig } from "../src/application/database-contract.js";
import { assertIdempotencyReplaySafe, createIdempotencyRecord, resolveIdempotency } from "../src/application/idempotency-contract.js";
import { assertCriticalTransactionBoundary, runCriticalTransaction } from "../src/application/transaction-contract.js";
import { assertOutboxReplaySafe, createOutboxEvent, nextOutboxAttempt } from "../src/application/outbox-contract.js";

test("P13.6961 database config validates without connecting to a database", () => {
  assert.doesNotThrow(() => validateDatabaseConfig({ environment: "TEST", url: "postgres://synthetic", poolSize: 2, timeoutMs: 1000, allowProduction: false }));
  assert.throws(() => validateDatabaseConfig({ environment: "PRODUCTION", url: "postgres://synthetic", poolSize: 2, timeoutMs: 1000, allowProduction: false }), /not authorized/i);
});

test("P13.7000 schema matrix stays migration-frozen", () => {
  const matrix = createSchemaContractMatrix({ contractVersion: "DB-CONTRACT-1.0", inspectedEnvironment: "NOT_CONNECTED", entries: [
    { kind: "TABLE", name: "synthetic_example", expectedDefinition: "synthetic-only", status: "NOT_INSPECTED" },
  ]});
  assertMigrationFreeze(matrix);
  assert.throws(() => assertNoUnreviewedSchemaDrift(matrix), /blocking difference/i);
});

test("P13.7040 idempotency rejects key reuse with different request", () => {
  const record = createIdempotencyRecord({ idempotencyKey: "idem-1", commandType: "LEAVE_RECEIVE", requestHash: "hash-a", status: "COMPLETED", createdAt: "2026-09-15T00:00:00Z" });
  assert.equal(resolveIdempotency(record, "hash-a"), "REPLAY");
  assert.equal(resolveIdempotency(record, "hash-b"), "CONFLICT");
  assert.throws(() => assertIdempotencyReplaySafe(record, "hash-b"), /different request/i);
});

test("P13.7080 critical mutation requires all safety boundaries", () => {
  assert.doesNotThrow(() => assertCriticalTransactionBoundary({ mutation: true, transactional: true, audited: true, idempotent: true }));
  assert.throws(() => assertCriticalTransactionBoundary({ mutation: true, transactional: true, audited: false, idempotent: true }), /mandatory audit/i);
});

test("P13.7100 transaction context is mandatory", async () => {
  const context = { transactionId: "tx-1", requestId: "req-1", correlationId: "corr-1", idempotencyKey: "idem-1" };
  const result = await runCriticalTransaction(async (_context, work) => work(), context, async () => "COMMITTED");
  assert.equal(result, "COMMITTED");
  await assert.rejects(() => runCriticalTransaction(async (_context, work) => work(), { ...context, transactionId: "" }, async () => "bad"), /incomplete/i);
});

test("P13.7120 outbox payload drift is rejected", () => {
  const event = createOutboxEvent({ eventId: "event-1", aggregateType: "LEAVE", aggregateId: "leave-1", eventType: "LEAVE_RECEIVED", payload: {}, payloadFingerprint: "fp-a", occurredAt: "2026-09-15T00:00:00Z", status: "PENDING", attemptCount: 0 });
  assert.equal(nextOutboxAttempt(event, "PUBLISHED").attemptCount, 1);
  const drift = createOutboxEvent({ ...event, payloadFingerprint: "fp-b" });
  assert.throws(() => assertOutboxReplaySafe(event, drift), /payload drift/i);
});
