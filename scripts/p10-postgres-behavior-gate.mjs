import { createHash } from "node:crypto";

export const POSTGRES_BEHAVIOR_GATE_VERSION = "P10.277-284-v1";

const PROD_HOST_MARKERS = ["tmmhxqgzelgrsrxbbfzh.supabase.co"];
const requiredEnv = ["APP_ENV", "MIGRATION_FREEZE", "AI_ENABLED", "ALLOW_DB_TEST_EXECUTION", "TEST_DATABASE_URL"];

export function validateExecutionEnvironment(env = process.env) {
  for (const key of requiredEnv) {
    if (!env[key]) throw new Error(`MISSING_REQUIRED_ENV:${key}`);
  }
  if (env.APP_ENV !== "test") throw new Error("APP_ENV_TEST_REQUIRED");
  if (env.MIGRATION_FREEZE !== "true") throw new Error("MIGRATION_FREEZE_REQUIRED");
  if (env.AI_ENABLED !== "false") throw new Error("AI_MUST_BE_FALSE");
  if (env.ALLOW_DB_TEST_EXECUTION !== "true") throw new Error("DB_TEST_EXECUTION_NOT_EXPLICITLY_ENABLED");

  const url = new URL(env.TEST_DATABASE_URL);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("POSTGRES_DATABASE_URL_REQUIRED");
  }
  if (PROD_HOST_MARKERS.some((host) => url.hostname === host)) {
    throw new Error("PRODUCTION_DATABASE_HOST_REJECTED");
  }

  return {
    appEnv: "test",
    migrationFreeze: true,
    aiEnabled: false,
    productionMutation: false,
    externalTransport: false,
  };
}

export async function runPostgresBehaviorGate({ env = process.env, adapter }) {
  const controls = validateExecutionEnvironment(env);
  if (!adapter || typeof adapter.runCase !== "function") {
    throw new Error("POSTGRES_BEHAVIOR_ADAPTER_REQUIRED");
  }

  const caseNames = [
    "TRANSACTION_COMMIT",
    "TRANSACTION_ROLLBACK",
    "IDEMPOTENCY_REPLAY",
    "IDEMPOTENCY_CONFLICT",
    "CONCURRENT_ACCESS",
    "AUDIT_ATOMICITY",
    "OUTBOX_ATOMICITY",
    "RLS_DENIAL",
  ];

  const results = [];
  for (const name of caseNames) {
    const result = await adapter.runCase(name);
    results.push({ name, status: result === true ? "PASS" : "FAIL" });
  }

  const allPass = results.every((x) => x.status === "PASS");
  const evidence = {
    version: POSTGRES_BEHAVIOR_GATE_VERSION,
    controls,
    cases: results,
    status: allPass ? "POSTGRES_BEHAVIOR_PASS" : "POSTGRES_BEHAVIOR_FAIL",
  };
  evidence.evidenceFingerprint = createHash("sha256")
    .update(JSON.stringify(evidence))
    .digest("hex");
  return evidence;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.error("P10 PostgreSQL behavior gate is a guarded library entrypoint; a dedicated non-production adapter is required.");
}
