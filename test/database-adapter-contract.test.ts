import test from "node:test";
import assert from "node:assert/strict";
import {
  assertDatabaseRoleForRuntime,
  createDatabaseAdapterContract,
  validateDatabaseAdapterConfig,
} from "../src/application/database-adapter-contract.js";

test("database adapter requires a database URL", () => {
  assert.throws(() => validateDatabaseAdapterConfig({ role: "APPLICATION", databaseUrl: "" }), /DATABASE_URL/);
});

test("database adapter validates bounded pool and timeout settings", () => {
  assert.throws(() => validateDatabaseAdapterConfig({ role: "APPLICATION", databaseUrl: "postgres://synthetic", poolSize: 0 }), /DATABASE_POOL_SIZE/);
  assert.throws(() => validateDatabaseAdapterConfig({ role: "APPLICATION", databaseUrl: "postgres://synthetic", statementTimeoutMs: 0 }), /DATABASE_TIMEOUT_MS/);
});

test("migration role remains blocked while migration freeze is active", () => {
  assert.throws(() => assertDatabaseRoleForRuntime("MIGRATION"), /MIGRATION_ROLE_BLOCKED_BY_GOVERNANCE_FREEZE/);
});

test("adapter contract is deliberately non-executable until runtime binding is authorized", async () => {
  const adapter = createDatabaseAdapterContract({ role: "APPLICATION", databaseUrl: "postgres://synthetic" });
  assert.equal(adapter.state, "UNINITIALIZED");
  assert.equal(adapter.role, "APPLICATION");
  await assert.rejects(() => adapter.execute({ text: "SELECT 1", parameters: [] }), /DATABASE_ADAPTER_RUNTIME_NOT_BOUND/);
  await assert.rejects(() => adapter.beginTransaction("tx-001"), /DATABASE_ADAPTER_RUNTIME_NOT_BOUND/);
  await adapter.close();
  assert.equal(adapter.state, "CLOSED");
});

test("empty transaction identity fails closed", async () => {
  const adapter = createDatabaseAdapterContract({ role: "READ_ONLY", databaseUrl: "postgres://synthetic" });
  await assert.rejects(() => adapter.beginTransaction(""), /TRANSACTION_ID_REQUIRED/);
});
