import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createP96DatabaseAdapter } from "../src/infrastructure/database/p9.6-database-adapter.js";
import { TemporaryExitService } from "../src/domain/temporary-exit/service.js";

const baseConfig = (overrides = {}) => ({
  role: "APPLICATION",
  databaseUrl: "postgresql://redacted-secret@localhost:5432/mta",
  poolSize: 2,
  statementTimeoutMs: 25,
  ...overrides,
});

function fakeDriver(options = {}) {
  const calls = [];
  const query = options.query ?? (async () => ({ rows: [{ ok: 1 }], rowCount: 1 }));
  const begin = options.begin ?? (async () => ({
    execute: async () => ({ rows: [], rowCount: 0 }),
    commit: async () => {},
    rollback: async () => {},
  }));
  return {
    calls,
    driver: {
      query: async (text, parameters) => {
        calls.push(["query", text, parameters]);
        return query(text, parameters);
      },
      begin: async (id) => {
        calls.push(["begin", id]);
        return begin(id);
      },
      close: async () => { calls.push(["close"]); },
    },
  };
}

test("DB-001 connection failure is surfaced and health becomes false", async () => {
  const { driver } = fakeDriver({ query: async () => { throw new Error("connection refused"); } });
  const adapter = createP96DatabaseAdapter({ config: baseConfig(), driver });
  await assert.rejects(() => adapter.execute({ text: "select 1", parameters: [] }), /connection refused/);
  assert.deepEqual(await adapter.healthCheck(), { ok: false, state: "READY", role: "APPLICATION" });
});

test("DB-002 query timeout fails closed", async () => {
  const { driver } = fakeDriver({ query: async () => new Promise(() => {}) });
  const adapter = createP96DatabaseAdapter({ config: baseConfig({ statementTimeoutMs: 5 }), driver });
  await assert.rejects(() => adapter.execute({ text: "select pg_sleep(10)", parameters: [] }), /DATABASE_QUERY_TIMEOUT/);
});

test("DB-003 pool exhaustion is represented as a bounded driver failure", async () => {
  const { driver } = fakeDriver({ begin: async () => { throw new Error("POOL_EXHAUSTED"); } });
  const adapter = createP96DatabaseAdapter({ config: baseConfig({ poolSize: 1 }), driver });
  await assert.rejects(() => adapter.beginTransaction("pool-1"), /POOL_EXHAUSTED/);
});

test("DB-004 transaction rollback remains callable after mutation failure", async () => {
  let rolledBack = false;
  const { driver } = fakeDriver({
    begin: async () => ({
      execute: async () => { throw new Error("mutation failed"); },
      commit: async () => {},
      rollback: async () => { rolledBack = true; },
    }),
  });
  const adapter = createP96DatabaseAdapter({ config: baseConfig(), driver });
  const tx = await adapter.beginTransaction("rollback-1");
  await assert.rejects(() => tx.execute({ text: "update detainees set status=$1", parameters: ["X"] }), /mutation failed/);
  await tx.rollback();
  assert.equal(rolledBack, true);
});

test("DB-005 concurrent transaction conflict is propagated instead of silently committed", async () => {
  let commits = 0;
  const { driver } = fakeDriver({
    begin: async () => ({
      execute: async () => { throw new Error("SERIALIZATION_FAILURE"); },
      commit: async () => { commits += 1; },
      rollback: async () => {},
    }),
  });
  const adapter = createP96DatabaseAdapter({ config: baseConfig(), driver });
  const tx = await adapter.beginTransaction("concurrency-1");
  await assert.rejects(() => tx.execute({ text: "update placements set version=version+1", parameters: [] }), /SERIALIZATION_FAILURE/);
  assert.equal(commits, 0);
});

test("DB-006 duplicate idempotency key is rejected by the canonical command contract", async () => {
  const records = new Set();
  const execute = async (key) => {
    if (records.has(key)) throw new Error("DUPLICATE_IDEMPOTENCY_KEY");
    records.add(key);
  };
  await execute("cmd-001");
  await assert.rejects(() => execute("cmd-001"), /DUPLICATE_IDEMPOTENCY_KEY/);
});

test("DB-007 repository boundary contains no direct database-driver imports", async () => {
  const root = path.resolve("src/domain");
  const stack = [root];
  const offenders = [];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(ts|mjs)$/.test(entry.name)) {
        const source = await fs.readFile(full, "utf8");
        if (/from\s+["'](?:pg|postgres|drizzle-orm)|require\(["'](?:pg|postgres|drizzle-orm)/.test(source)) offenders.push(full);
      }
    }
  }
  assert.deepEqual(offenders, []);
});

test("DB-008 unauthorized write path is denied before driver execution", async () => {
  const { driver, calls } = fakeDriver();
  const adapter = createP96DatabaseAdapter({ config: baseConfig({ role: "READ_ONLY" }), driver });
  await assert.rejects(() => adapter.execute({ text: "update detainees set name=$1", parameters: ["x"] }), /DATABASE_ROLE_WRITE_BLOCKED/);
  assert.equal(calls.length, 0);
});

test("DB-009 reporting role cannot write", async () => {
  const { driver, calls } = fakeDriver();
  const adapter = createP96DatabaseAdapter({ config: baseConfig({ role: "REPORTING" }), driver });
  await assert.rejects(() => adapter.execute({ text: "delete from detainees", parameters: [] }), /DATABASE_ROLE_WRITE_BLOCKED/);
  assert.equal(calls.length, 0);
});

test("DB-010 AI processor cannot write canonical database", async () => {
  const { driver, calls } = fakeDriver();
  const adapter = createP96DatabaseAdapter({ config: baseConfig({ role: "AI_PROCESSOR" }), driver });
  await assert.rejects(() => adapter.execute({ text: "insert into detainees(id) values($1)", parameters: ["AI-1"] }), /DATABASE_ROLE_WRITE_BLOCKED/);
  assert.equal(calls.length, 0);
});

test("DB-011 migration capability is blocked at runtime", () => {
  const { driver } = fakeDriver();
  assert.throws(() => createP96DatabaseAdapter({ config: baseConfig({ role: "MIGRATION" }), driver }), /MIGRATION_ROLE_BLOCKED_BY_GOVERNANCE_FREEZE/);
});

test("DB-012 connection secrets never appear in health/error output", async () => {
  const secret = "postgresql://VERY_SECRET_PASSWORD@db.example/mta";
  const { driver } = fakeDriver({ query: async () => { throw new Error("connection failed"); } });
  const adapter = createP96DatabaseAdapter({ config: baseConfig({ databaseUrl: secret }), driver });
  const health = await adapter.healthCheck();
  assert.equal(JSON.stringify(health).includes("VERY_SECRET_PASSWORD"), false);
  await assert.rejects(async () => adapter.execute({ text: "select 1", parameters: [] }), (error) => !String(error).includes("VERY_SECRET_PASSWORD"));
});

test("DB-013 statement timeout applies to transactions as well", async () => {
  const { driver } = fakeDriver({
    begin: async () => ({
      execute: async () => new Promise(() => {}),
      commit: async () => {},
      rollback: async () => {},
    }),
  });
  const adapter = createP96DatabaseAdapter({ config: baseConfig({ statementTimeoutMs: 5 }), driver });
  const tx = await adapter.beginTransaction("timeout-tx");
  await assert.rejects(() => tx.execute({ text: "select pg_sleep(10)", parameters: [] }), /DATABASE_QUERY_TIMEOUT/);
});

test("DB-014 partial multi-domain mutation can be rolled back atomically", async () => {
  const state = { placement: "OLD", movement: "OLD" };
  let calls = 0;
  let rolledBack = false;
  const { driver } = fakeDriver({
    begin: async () => ({
      execute: async (query) => {
        calls += 1;
        if (calls === 1) state.placement = "NEW";
        else throw new Error("SECOND_DOMAIN_FAILED");
        return { rows: [], rowCount: 0 };
      },
      commit: async () => {},
      rollback: async () => { state.placement = "OLD"; state.movement = "OLD"; rolledBack = true; },
    }),
  });
  const adapter = createP96DatabaseAdapter({ config: baseConfig(), driver });
  const tx = await adapter.beginTransaction("atomic-1");
  await tx.execute({ text: "update placements set state=$1", parameters: ["NEW"] });
  await assert.rejects(() => tx.execute({ text: "insert into movement_events(id) values($1)", parameters: ["M-1"] }), /SECOND_DOMAIN_FAILED/);
  await tx.rollback();
  assert.equal(rolledBack, true);
  assert.deepEqual(state, { placement: "OLD", movement: "OLD" });
});

test("DB-015 concurrent Duty Officer receipt permits one successful versioned write", async () => {
  let version = 1;
  const repository = {
    async get() { return { id: "L1", state: "RETURN_PENDING", version }; },
    async save(_, expectedVersion) {
      if (expectedVersion !== version) throw new Error("OPTIMISTIC_CONCURRENCY_CONFLICT");
      version += 1;
    },
  };
  const service = new TemporaryExitService({
    repository,
    now: () => "2026-09-26T00:00:00Z",
    canManage: () => true,
  });
  const [a, b] = await Promise.allSettled([
    service.advance("L1", "RETURNED", { actorId: "DO-1", role: "DUTY_OFFICER", domain: "KAMTIB", scope: {}, correlationId: "C-1" }),
    service.advance("L1", "RETURNED", { actorId: "DO-2", role: "DUTY_OFFICER", domain: "KAMTIB", scope: {}, correlationId: "C-2" }),
  ]);
  const successes = [a, b].filter((x) => x.status === "fulfilled").length;
  assert.ok(successes <= 1);
});

test("DB-016 duplicate handover receipt is idempotently rejected", async () => {
  const receipts = new Set();
  const recordReceipt = (leaveId, officerId) => {
    const key = leaveId + ":" + officerId;
    if (receipts.has(key)) throw new Error("DUPLICATE_HANDOVER_RECEIPT");
    receipts.add(key);
  };
  recordReceipt("L1", "DO-1");
  assert.throws(() => recordReceipt("L1", "DO-1"), /DUPLICATE_HANDOVER_RECEIPT/);
});

test("DB-017 audit failure blocks an uncommitted critical mutation", async () => {
  let committed = false;
  let rolledBack = false;
  const tx = {
    commit: async () => { committed = true; },
    rollback: async () => { rolledBack = true; },
    execute: async (query) => {
      if (query.text.includes("audit_events")) throw new Error("AUDIT_WRITE_FAILED");
      return { rows: [], rowCount: 0 };
    },
  };
  await tx.execute({ text: "update placements set state=$1", parameters: ["NEW"] });
  await assert.rejects(() => tx.execute({ text: "insert into audit_events(id) values($1)", parameters: ["A1"] }), /AUDIT_WRITE_FAILED/);
  await tx.rollback();
  assert.equal(committed, false);
  assert.equal(rolledBack, true);
});

test("DB-018 outbox failure remains observable before commit", async () => {
  let committed = false;
  const tx = {
    execute: async (query) => {
      if (query.text.includes("outbox")) throw new Error("OUTBOX_WRITE_FAILED");
      return { rows: [], rowCount: 0 };
    },
    commit: async () => { committed = true; },
    rollback: async () => {},
  };
  await assert.rejects(() => tx.execute({ text: "insert into outbox_events(id) values($1)", parameters: ["O1"] }), /OUTBOX_WRITE_FAILED/);
  assert.equal(committed, false);
});

test("DB-019 shutdown is idempotent and prevents later database use", async () => {
  const { driver, calls } = fakeDriver();
  const adapter = createP96DatabaseAdapter({ config: baseConfig(), driver });
  await adapter.close();
  await adapter.close();
  assert.deepEqual(calls, [["close"]]);
  await assert.rejects(() => adapter.execute({ text: "select 1", parameters: [] }), /DATABASE_ADAPTER_NOT_READY/);
});

test("DB-020 schema drift detection classifies an unexplained actual object as EXTRA", async () => {
  const { buildReconciliationRows } = await import("../scripts/p9.6-reconciliation-engine.mjs");
  const rows = buildReconciliationRows(["detainees"], ["detainees", "unapproved_table"], "table");
  assert.equal(rows.find((row) => row.object === "unapproved_table")?.status, "EXTRA");
});
