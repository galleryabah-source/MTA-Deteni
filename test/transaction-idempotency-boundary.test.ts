import test from "node:test";
import assert from "node:assert/strict";
import type { IdempotencyRecord } from "../src/application/idempotency-contract.js";
import type { DatabaseTransaction } from "../src/application/database-adapter-contract.js";
import { resolveTransactionIdempotency, withDatabaseTransaction } from "../src/application/transaction-idempotency-boundary.js";

const context = (overrides: Partial<{ transactionId: string; idempotencyKey: string }> = {}) => ({
  transactionId: overrides.transactionId ?? "tx-001",
  requestId: "req-001",
  correlationId: "corr-001",
  idempotencyKey: overrides.idempotencyKey ?? "idem-001",
});

const completed: IdempotencyRecord = {
  idempotencyKey: "idem-001",
  commandType: "DETAINEE_REGISTER",
  requestHash: "hash-1",
  status: "COMPLETED",
  responseFingerprint: "response-1",
  createdAt: "2026-09-16T00:00:00.000Z",
  completedAt: "2026-09-16T00:00:00.000Z",
};

test("transaction idempotency boundary preserves deterministic execute/replay/conflict decisions", () => {
  assert.equal(resolveTransactionIdempotency(context(), undefined, "hash-1").decision, "EXECUTE");
  assert.equal(resolveTransactionIdempotency(context(), completed, "hash-1").decision, "REPLAY");
  assert.equal(resolveTransactionIdempotency(context(), completed, "hash-2").decision, "CONFLICT");
});

test("transaction idempotency boundary rejects missing identities", () => {
  assert.throws(() => resolveTransactionIdempotency(context({ transactionId: "" }), undefined, "hash-1"), /TRANSACTION_ID_REQUIRED/);
  assert.throws(() => resolveTransactionIdempotency(context({ idempotencyKey: "" }), undefined, "hash-1"), /IDEMPOTENCY_KEY_REQUIRED/);
  assert.throws(() => resolveTransactionIdempotency(context(), undefined, ""), /REQUEST_HASH_REQUIRED/);
});

test("database transaction commits only after work succeeds", async () => {
  const calls: string[] = [];
  const tx = {
    transactionId: "tx-001",
    execute: async () => ({ rows: [], rowCount: 0 }),
    commit: async () => { calls.push("commit"); },
    rollback: async () => { calls.push("rollback"); },
  } satisfies DatabaseTransaction;

  const result = await withDatabaseTransaction(tx, async () => "ok");
  assert.equal(result, "ok");
  assert.deepEqual(calls, ["commit"]);
});

test("database transaction rolls back on domain or evidence failure", async () => {
  const calls: string[] = [];
  const tx = {
    transactionId: "tx-001",
    execute: async () => ({ rows: [], rowCount: 0 }),
    commit: async () => { calls.push("commit"); },
    rollback: async () => { calls.push("rollback"); },
  } satisfies DatabaseTransaction;

  await assert.rejects(() => withDatabaseTransaction(tx, async () => { throw new Error("WORK_FAILURE"); }), /WORK_FAILURE/);
  assert.deepEqual(calls, ["rollback"]);
});
