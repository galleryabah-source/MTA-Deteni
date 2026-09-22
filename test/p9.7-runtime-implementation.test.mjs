import test from "node:test";
import assert from "node:assert/strict";
import {
  createTransactionRunner,
  createIdempotencyStore,
  TransactionError,
  TRANSACTION_IDEMPOTENCY_VERSION,
} from "../src/infrastructure/database/transaction-idempotency.mjs";

test("P9.7 implementation exposes the canonical version and rejects missing adapter/work", async () => {
  assert.equal(TRANSACTION_IDEMPOTENCY_VERSION, "P9.7-IMPLEMENTATION-v2");
  assert.throws(() => createTransactionRunner(), (error) =>
    error instanceof TransactionError && error.code === "ADAPTER_REQUIRED"
  );
  const adapter = { execute: async () => ({ rows: [], rowCount: 0 }) };
  const runner = createTransactionRunner(adapter);
  await assert.rejects(
    () => runner.transaction(),
    (error) => error instanceof TransactionError && error.code === "WORK_REQUIRED"
  );
});

test("P9.7 implementation commits after successful work and rolls back on failure", async () => {
  const calls = [];
  const adapter = {
    execute: async ({ text, parameters }) => {
      calls.push({ text, parameters });
      return { rows: [], rowCount: 0 };
    },
  };
  const runner = createTransactionRunner(adapter);

  const result = await runner.transaction(async ({ transactionId }) => {
    assert.match(transactionId, /^[0-9a-f-]{36}$/i);
    return "OK";
  });

  assert.equal(result, "OK");
  assert.deepEqual(calls.map((x) => x.text), ["BEGIN", "COMMIT"]);
  assert.deepEqual(calls[0].parameters, []);

  calls.length = 0;
  await assert.rejects(
    () => runner.transaction(async () => { throw new Error("DOMAIN_FAILURE"); }),
    /DOMAIN_FAILURE/
  );
  assert.deepEqual(calls.map((x) => x.text), ["BEGIN", "ROLLBACK"]);
});

test("P9.7 idempotency implementation is deterministic for execute, replay and conflict", () => {
  const store = createIdempotencyStore();

  assert.deepEqual(store.begin("idem-1", "hash-1"), { status: "ACQUIRED" });
  assert.deepEqual(store.begin("idem-1", "hash-1"), { status: "IN_PROGRESS" });
  assert.throws(
    () => store.begin("idem-1", "hash-2"),
    (error) => error instanceof TransactionError && error.code === "IDEMPOTENCY_CONFLICT"
  );

  assert.deepEqual(store.complete("idem-1", "response-1"), { status: "COMPLETED" });
  assert.deepEqual(store.begin("idem-1", "hash-1"), {
    status: "REPLAY",
    responseHash: "response-1",
  });
});

test("P9.7 idempotency implementation rejects invalid completion transitions", () => {
  const store = createIdempotencyStore();

  assert.throws(
    () => store.complete("missing", "response"),
    (error) => error instanceof TransactionError && error.code === "IDEMPOTENCY_NOT_FOUND"
  );

  store.begin("idem-2", "hash-2");
  store.complete("idem-2", "response-2");

  assert.throws(
    () => store.complete("idem-2", "response-3"),
    (error) => error instanceof TransactionError && error.code === "IDEMPOTENCY_NOT_IN_PROGRESS"
  );
});
