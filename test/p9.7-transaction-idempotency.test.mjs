import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("P9.7-G execution context contract is fail-closed and complete", () => {
  const source = read("src/application/execution-context-contract.ts");
  for (const marker of [
    "requestId: string",
    "correlationId: string",
    "transactionId: string",
    "idempotencyKey: string",
    "REQUEST_ID_REQUIRED",
    "CORRELATION_ID_REQUIRED",
    "TRANSACTION_ID_REQUIRED",
    "IDEMPOTENCY_KEY_REQUIRED",
    "EXECUTION_CONTEXT_MISMATCH",
  ]) assert.ok(source.includes(marker), marker);
});

test("P9.7-G transaction runner commits on success and rolls back on failure", async () => {
  const { createTransactionRunner } = await import("../src/infrastructure/database/transaction-idempotency.mjs");
  const calls = [];
  const adapter = { query: async ({ text }) => { calls.push(text); } };
  const runner = createTransactionRunner(adapter);
  const value = await runner.transaction(async ({ transactionId }) => {
    assert.match(transactionId, /^[0-9a-f-]{36}$/);
    return "ok";
  });
  assert.equal(value, "ok");
  assert.deepEqual(calls, ["BEGIN", "COMMIT"]);

  const failedCalls = [];
  const failed = createTransactionRunner({ query: async ({ text }) => { failedCalls.push(text); } });
  await assert.rejects(() => failed.transaction(async () => { throw new Error("EXPECTED_FAILURE"); }), /EXPECTED_FAILURE/);
  assert.deepEqual(failedCalls, ["BEGIN", "ROLLBACK"]);
});

test("P9.7-H idempotency replay and conflict semantics are deterministic", async () => {
  const { createIdempotencyStore, TransactionError } = await import("../src/infrastructure/database/transaction-idempotency.mjs");
  const store = createIdempotencyStore();

  assert.deepEqual(store.begin("K-1", "H-1"), { status: "ACQUIRED" });
  assert.deepEqual(store.complete("K-1", "R-1"), { status: "COMPLETED" });
  assert.deepEqual(store.begin("K-1", "H-1"), { status: "REPLAY", responseHash: "R-1" });

  assert.throws(
    () => store.begin("K-1", "H-2"),
    (error) => error instanceof TransactionError && error.code === "IDEMPOTENCY_CONFLICT",
  );

  assert.deepEqual(store.begin("K-2", "H-2"), { status: "ACQUIRED" });
  assert.deepEqual(store.begin("K-2", "H-2"), { status: "IN_PROGRESS" });
});

test("P9.7-H production bridge preserves request/correlation/idempotency identity", () => {
  const source = read("supabase/functions/mta-api/index.ts");
  for (const marker of [
    "X-Request-Id",
    "X-Correlation-Id",
    "Idempotency-Key",
    "requestHash",
    "mta_execute_idempotent_mutation",
    "p_idempotency_key",
    "p_request_hash",
    "p_audit",
  ]) assert.ok(source.includes(marker), marker);
});

test("P9.7-H production idempotency path is structurally atomic", () => {
  const source = read("supabase/functions/mta-api/index.ts");
  assert.ok(source.includes('admin.rpc("mta_execute_idempotent_mutation"'));
  const dbFiles = fs.readdirSync(path.join(root, "supabase/migrations"), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"));
  assert.ok(dbFiles.length > 0);
  const migrationText = dbFiles.map((entry) => read(path.join("supabase/migrations", entry.name))).join("\n");
  assert.ok(migrationText.includes("mta_internal.execute_idempotent_mutation"));
});
