import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("P9.7 canonical transaction runner: commit and deterministic rollback", async () => {
  const { createTransactionRunner } = await import("../src/infrastructure/database/transaction-idempotency.mjs");
  const calls = [];
  const runner = createTransactionRunner({ query: async ({ text }) => calls.push(text) });
  assert.equal(await runner.transaction(async ({ transactionId }) => {
    assert.match(transactionId, /^[0-9a-f-]{36}$/);
    return "OK";
  }), "OK");
  assert.deepEqual(calls, ["BEGIN", "COMMIT"]);

  const failedCalls = [];
  const failed = createTransactionRunner({ query: async ({ text }) => failedCalls.push(text) });
  await assert.rejects(() => failed.transaction(async () => { throw new Error("EXPECTED_FAILURE"); }), /EXPECTED_FAILURE/);
  assert.deepEqual(failedCalls, ["BEGIN", "ROLLBACK"]);
});

test("P9.7 canonical idempotency: acquire, replay, conflict and in-progress are deterministic", async () => {
  const { createIdempotencyStore, TransactionError } = await import("../src/infrastructure/database/transaction-idempotency.mjs");
  const store = createIdempotencyStore();

  assert.deepEqual(store.begin("P97-K-001", "H-001"), { status: "ACQUIRED" });
  assert.deepEqual(store.complete("P97-K-001", "R-001"), { status: "COMPLETED" });
  assert.deepEqual(store.begin("P97-K-001", "H-001"), { status: "REPLAY", responseHash: "R-001" });
  assert.throws(() => store.begin("P97-K-001", "H-002"), (e) => e instanceof TransactionError && e.code === "IDEMPOTENCY_CONFLICT");

  assert.deepEqual(store.begin("P97-K-002", "H-002"), { status: "ACQUIRED" });
  assert.deepEqual(store.begin("P97-K-002", "H-002"), { status: "IN_PROGRESS" });
});

test("P9.7 canonical boundary: HTTP identity reaches durable RPC contract", () => {
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

test("P9.7 recovered migration lineage contains the canonical durable boundary", () => {
  const archive = "docs/03-implementation/P9.7-recovered-migration-sources";
  const files = fs.readdirSync(path.join(root, archive)).filter((name) => name.endsWith(".sql")).sort();
  assert.deepEqual(files, [
    "20260922220723_mta_p97_durable_idempotency_transaction_boundary_v1.sql",
    "20260922220740_mta_p97_durable_idempotency_transaction_boundary_v2.sql",
    "20260922220754_mta_p97_durable_idempotency_transaction_boundary_v3.sql",
    "20260922220814_mta_p97_durable_idempotency_rpc_wrapper_v1.sql",
  ]);
  const sql = files.map((name) => read(path.join(archive, name))).join("\n");
  assert.match(sql, /mta_internal\.idempotency_keys/);
  assert.match(sql, /mta_internal\.execute_idempotent_mutation/);
  assert.match(sql, /mta_execute_idempotent_mutation/);
});

test("P9.7 concurrent duplicate model: one acquisition, all same-key retries observe the same terminal response", async () => {
  const { createIdempotencyStore } = await import("../src/infrastructure/database/transaction-idempotency.mjs");
  const store = createIdempotencyStore();
  const results = await Promise.all(Array.from({ length: 16 }, async () => store.begin("P97-CONCURRENT-001", "H-CONCURRENT-001")));
  assert.equal(results.filter((r) => r.status === "ACQUIRED").length, 1);
  assert.equal(results.filter((r) => r.status === "IN_PROGRESS").length, 15);
  assert.deepEqual(store.complete("P97-CONCURRENT-001", "R-CONCURRENT-001"), { status: "COMPLETED" });
  assert.deepEqual(store.begin("P97-CONCURRENT-001", "H-CONCURRENT-001"), { status: "REPLAY", responseHash: "R-CONCURRENT-001" });
});

test("P9.7 invalid transition and retry contract", async () => {
  const { createIdempotencyStore, TransactionError } = await import("../src/infrastructure/database/transaction-idempotency.mjs");
  const store = createIdempotencyStore();
  assert.throws(() => store.complete("P97-MISSING", "R"), (e) => e instanceof TransactionError && e.code === "IDEMPOTENCY_NOT_FOUND");
  assert.throws(() => store.complete("P97-RETRY", "R2"), (e) => e instanceof TransactionError && e.code === "IDEMPOTENCY_NOT_FOUND");
  assert.deepEqual(store.begin("P97-RETRY", "H-RETRY"), { status: "ACQUIRED" });
});
