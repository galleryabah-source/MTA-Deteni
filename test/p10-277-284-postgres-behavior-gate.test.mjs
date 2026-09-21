import test from "node:test";
import assert from "node:assert/strict";
import { runPostgresBehaviorGate, validateExecutionEnvironment } from "../scripts/p10-postgres-behavior-gate.mjs";

const env = {
  APP_ENV: "test",
  MIGRATION_FREEZE: "true",
  AI_ENABLED: "false",
  ALLOW_DB_TEST_EXECUTION: "true",
  TEST_DATABASE_URL: "postgresql://test@localhost:5432/mta_deteni_test",
};

test("P10.277 accepts only guarded test environment", () => {
  assert.equal(validateExecutionEnvironment(env).appEnv, "test");
});

test("P10.278 rejects the known production Supabase host", () => {
  assert.throws(
    () => validateExecutionEnvironment({
      ...env,
      TEST_DATABASE_URL: "postgresql://x@tmmhxqgzelgrsrxbbfzh.supabase.co/postgres",
    }),
    /PRODUCTION_DATABASE_HOST_REJECTED/,
  );
});

test("P10.279 requires explicit DB execution opt-in", () => {
  assert.throws(
    () => validateExecutionEnvironment({ ...env, ALLOW_DB_TEST_EXECUTION: "false" }),
    /DB_TEST_EXECUTION_NOT_EXPLICITLY_ENABLED/,
  );
});

test("P10.280 requires migration freeze", () => {
  assert.throws(
    () => validateExecutionEnvironment({ ...env, MIGRATION_FREEZE: "false" }),
    /MIGRATION_FREEZE_REQUIRED/,
  );
});

test("P10.281 rejects AI-enabled DB rehearsal", () => {
  assert.throws(
    () => validateExecutionEnvironment({ ...env, AI_ENABLED: "true" }),
    /AI_MUST_BE_FALSE/,
  );
});

test("P10.282 requires a PostgreSQL URL", () => {
  assert.throws(
    () => validateExecutionEnvironment({ ...env, TEST_DATABASE_URL: "https://example.invalid/db" }),
    /POSTGRES_DATABASE_URL_REQUIRED/,
  );
});

test("P10.283 executes all eight behavior cases through an injected adapter", async () => {
  const seen = [];
  const evidence = await runPostgresBehaviorGate({
    env,
    adapter: {
      async runCase(name) { seen.push(name); return true; },
    },
  });
  assert.equal(evidence.status, "POSTGRES_BEHAVIOR_PASS");
  assert.equal(seen.length, 8);
  assert.ok(evidence.cases.every((x) => x.status === "PASS"));
});

test("P10.284 fails closed when one behavior case fails", async () => {
  const evidence = await runPostgresBehaviorGate({
    env,
    adapter: {
      async runCase(name) { return name !== "RLS_DENIAL"; },
    },
  });
  assert.equal(evidence.status, "POSTGRES_BEHAVIOR_FAIL");
  assert.equal(evidence.cases.find((x) => x.name === "RLS_DENIAL").status, "FAIL");
});
