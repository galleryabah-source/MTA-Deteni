import test from "node:test";
import assert from "node:assert/strict";
import { createP96DatabaseAdapter } from "../src/infrastructure/database/p9.6-database-adapter.js";

const makeDriver = () => {
  const calls: string[] = [];
  return { calls, driver: {
    query: async <Row extends object = Record<string, unknown>>(text: string) => { calls.push("query:"+text); return { rows: [{ ok: 1 } as Row], rowCount: 1 }; },
    begin: async (transactionId: string) => { calls.push("begin:"+transactionId); return {
      execute: async <Row extends object = Record<string, unknown>>(query: { text: string; parameters: readonly unknown[] }) => { calls.push("tx:"+query.text); return { rows: [] as Row[], rowCount: 0 }; },
      commit: async () => { calls.push("commit"); }, rollback: async () => { calls.push("rollback"); },
    }; },
    close: async () => { calls.push("close"); },
  }};
};

test("P9.6 adapter executes through injected driver", async () => {
  const { calls, driver } = makeDriver();
  const adapter = createP96DatabaseAdapter({ config: { role: "APPLICATION", databaseUrl: "postgresql://redacted", poolSize: 5, statementTimeoutMs: 5000 }, driver });
  const result = await adapter.execute({ text: "select 1", parameters: [] });
  assert.equal(result.rowCount, 1); assert.deepEqual(calls, ["query:select 1"]);
});

test("P9.6 adapter provides explicit transaction lifecycle", async () => {
  const { calls, driver } = makeDriver();
  const adapter = createP96DatabaseAdapter({ config: { role: "APPLICATION", databaseUrl: "postgresql://redacted" }, driver });
  const tx = await adapter.beginTransaction("tx-001"); await tx.execute({ text: "select 1", parameters: [] }); await tx.commit();
  assert.deepEqual(calls, ["begin:tx-001", "tx:select 1", "commit"]);
});

test("P9.6 health check is non-secret", async () => {
  const { driver } = makeDriver();
  const adapter = createP96DatabaseAdapter({ config: { role: "READ_ONLY", databaseUrl: "postgresql://redacted" }, driver });
  assert.deepEqual(await adapter.healthCheck(), { ok: true, state: "READY", role: "READ_ONLY" });
});

test("P9.6 blocks migration and production access", () => {
  const { driver } = makeDriver();
  assert.throws(() => createP96DatabaseAdapter({ config: { role: "MIGRATION", databaseUrl: "postgresql://redacted" }, driver }), /MIGRATION_ROLE_BLOCKED_BY_GOVERNANCE_FREEZE/);
  assert.throws(() => createP96DatabaseAdapter({ config: { role: "APPLICATION", databaseUrl: "postgresql://redacted" }, driver, production: true }), /PRODUCTION_POSTGRES_NOT_AUTHORIZED/);
});

test("P9.6 close is idempotent and rejects later operations", async () => {
  const { calls, driver } = makeDriver();
  const adapter = createP96DatabaseAdapter({ config: { role: "APPLICATION", databaseUrl: "postgresql://redacted" }, driver });
  await adapter.close(); await adapter.close(); assert.deepEqual(calls, ["close"]);
  await assert.rejects(() => adapter.execute({ text: "select 1", parameters: [] }), /DATABASE_ADAPTER_NOT_READY/);
});
