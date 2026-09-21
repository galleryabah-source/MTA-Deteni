import { createHash } from "node:crypto";

export const POSTGRES_NONPROD_HARNESS_VERSION = "P10.261-268-v1";

const sha256 = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

const FORBIDDEN_PRODUCTION_MARKERS = [
  ".supabase.co",
  "production",
  "prod",
];

export function validateNonProductionDatabaseTarget(config) {
  if (!config || config.environment !== "TEST") {
    throw new Error("NONPROD_DATABASE_ENV_REQUIRED");
  }
  if (config.migrationFreeze !== true) {
    throw new Error("MIGRATION_FREEZE_REQUIRED");
  }
  if (config.aiEnabled !== false) {
    throw new Error("AI_MUST_REMAIN_DISABLED");
  }
  if (config.allowExecution !== true) {
    throw new Error("EXPLICIT_NONPROD_EXECUTION_OPT_IN_REQUIRED");
  }
  const target = String(config.target ?? "").toLowerCase();
  if (!target || FORBIDDEN_PRODUCTION_MARKERS.some((marker) => target.includes(marker))) {
    throw new Error("PRODUCTION_DATABASE_TARGET_REJECTED");
  }
  return {
    environment: "TEST",
    target,
    migrationFreeze: true,
    aiEnabled: false,
    productionMutation: false,
    externalTransport: false,
  };
}

export function buildPostgresHarnessPlan(config) {
  const controls = validateNonProductionDatabaseTarget(config);
  const operations = [
    "TRANSACTION_COMMIT",
    "TRANSACTION_ROLLBACK",
    "IDEMPOTENCY_REPLAY",
    "IDEMPOTENCY_CONFLICT",
    "CONCURRENT_ACCESS",
    "AUDIT_ATOMICITY",
    "OUTBOX_ATOMICITY",
    "RLS_DENIAL",
  ];
  const plan = {
    version: POSTGRES_NONPROD_HARNESS_VERSION,
    controls,
    operations,
  };
  return { ...plan, planFingerprint: sha256(plan) };
}
