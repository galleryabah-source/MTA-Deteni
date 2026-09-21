import { createHash } from "node:crypto";

export const DB_EVIDENCE_RECONCILIATION_VERSION = "P10.269-276-v1";

const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

const REQUIRED_CASES = [
  "TRANSACTION_COMMIT",
  "TRANSACTION_ROLLBACK",
  "IDEMPOTENCY_REPLAY",
  "IDEMPOTENCY_CONFLICT",
  "CONCURRENT_ACCESS",
  "AUDIT_ATOMICITY",
  "OUTBOX_ATOMICITY",
  "RLS_DENIAL",
];

export function reconcileDatabaseEvidence({ scenarioId, syntheticEvidence, databaseEvidence }) {
  if (!scenarioId || !syntheticEvidence || !databaseEvidence) {
    throw new Error("DB_EVIDENCE_INPUT_REQUIRED");
  }
  if (syntheticEvidence.productionMutation !== false ||
      syntheticEvidence.externalTransport !== false ||
      databaseEvidence.productionMutation !== false ||
      databaseEvidence.externalTransport !== false) {
    throw new Error("UNSAFE_PRODUCTION_BOUNDARY");
  }

  for (const name of REQUIRED_CASES) {
    if (syntheticEvidence.cases?.[name] !== "PASS") {
      throw new Error(`SYNTHETIC_CASE_NOT_PASS:${name}`);
    }
    if (databaseEvidence.cases?.[name] !== "PASS") {
      throw new Error(`DATABASE_CASE_NOT_PASS:${name}`);
    }
  }

  const comparison = {
    scenarioId,
    version: DB_EVIDENCE_RECONCILIATION_VERSION,
    cases: REQUIRED_CASES.map((name) => ({ name, synthetic: "PASS", database: "PASS" })),
    controls: {
      syntheticOnly: true,
      productionMutation: false,
      externalTransport: false,
    },
  };

  return {
    status: "DB_EVIDENCE_RECONCILED",
    ...comparison,
    reconciliationFingerprint: hash(comparison),
  };
}
