import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPostgresHarnessPlan,
  validateNonProductionDatabaseTarget,
} from "../src/infrastructure/database/postgres-nonprod-harness.mjs";

const base = {
  environment: "TEST",
  target: "postgresql://nonprod-test.invalid/mta_deteni_test",
  migrationFreeze: true,
  aiEnabled: false,
  allowExecution: true,
};

test("P10.261 accepts only explicit TEST database execution", () => {
  const result = validateNonProductionDatabaseTarget(base);
  assert.equal(result.environment, "TEST");
  assert.equal(result.productionMutation, false);
});

test("P10.262 rejects production Supabase target", () => {
  assert.throws(
    () => validateNonProductionDatabaseTarget({
      ...base,
      target: "postgresql://x@tmmhxqgzelgrsrxbbfzh.supabase.co/postgres",
    }),
    /PRODUCTION_DATABASE_TARGET_REJECTED/,
  );
});

test("P10.263 rejects production environment", () => {
  assert.throws(
    () => validateNonProductionDatabaseTarget({ ...base, environment: "PRODUCTION" }),
    /NONPROD_DATABASE_ENV_REQUIRED/,
  );
});

test("P10.264 requires migration freeze", () => {
  assert.throws(
    () => validateNonProductionDatabaseTarget({ ...base, migrationFreeze: false }),
    /MIGRATION_FREEZE_REQUIRED/,
  );
});

test("P10.265 requires AI OFF", () => {
  assert.throws(
    () => validateNonProductionDatabaseTarget({ ...base, aiEnabled: true }),
    /AI_MUST_REMAIN_DISABLED/,
  );
});

test("P10.266 requires explicit execution opt-in", () => {
  assert.throws(
    () => validateNonProductionDatabaseTarget({ ...base, allowExecution: false }),
    /EXPLICIT_NONPROD_EXECUTION_OPT_IN_REQUIRED/,
  );
});

test("P10.267 harness plan contains DB behavior proof cases", () => {
  const plan = buildPostgresHarnessPlan(base);
  assert.deepEqual(plan.operations, [
    "TRANSACTION_COMMIT",
    "TRANSACTION_ROLLBACK",
    "IDEMPOTENCY_REPLAY",
    "IDEMPOTENCY_CONFLICT",
    "CONCURRENT_ACCESS",
    "AUDIT_ATOMICITY",
    "OUTBOX_ATOMICITY",
    "RLS_DENIAL",
  ]);
  assert.equal(plan.planFingerprint.length, 64);
});

test("P10.268 harness plan is deterministic", () => {
  const a = buildPostgresHarnessPlan(base);
  const b = buildPostgresHarnessPlan(base);
  assert.equal(a.planFingerprint, b.planFingerprint);
});
