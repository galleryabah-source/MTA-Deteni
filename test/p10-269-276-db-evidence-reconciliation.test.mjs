import test from "node:test";
import assert from "node:assert/strict";
import { reconcileDatabaseEvidence } from "../src/infrastructure/certification/db-evidence-reconciliation.mjs";

const cases = Object.fromEntries([
  "TRANSACTION_COMMIT",
  "TRANSACTION_ROLLBACK",
  "IDEMPOTENCY_REPLAY",
  "IDEMPOTENCY_CONFLICT",
  "CONCURRENT_ACCESS",
  "AUDIT_ATOMICITY",
  "OUTBOX_ATOMICITY",
  "RLS_DENIAL",
].map((name) => [name, "PASS"]));

const evidence = { cases, productionMutation: false, externalTransport: false };

test("P10.269 reconciles synthetic and database cases", () => {
  const result = reconcileDatabaseEvidence({
    scenarioId: "scenario-001",
    syntheticEvidence: evidence,
    databaseEvidence: evidence,
  });
  assert.equal(result.status, "DB_EVIDENCE_RECONCILED");
  assert.equal(result.reconciliationFingerprint.length, 64);
});

test("P10.270 rejects incomplete database evidence", () => {
  const databaseEvidence = { ...evidence, cases: { ...cases, RLS_DENIAL: "FAIL" } };
  assert.throws(
    () => reconcileDatabaseEvidence({ scenarioId: "scenario-001", syntheticEvidence: evidence, databaseEvidence }),
    /DATABASE_CASE_NOT_PASS:RLS_DENIAL/,
  );
});

test("P10.271 rejects incomplete synthetic evidence", () => {
  const syntheticEvidence = { ...evidence, cases: { ...cases, AUDIT_ATOMICITY: "FAIL" } };
  assert.throws(
    () => reconcileDatabaseEvidence({ scenarioId: "scenario-001", syntheticEvidence, databaseEvidence: evidence }),
    /SYNTHETIC_CASE_NOT_PASS:AUDIT_ATOMICITY/,
  );
});

test("P10.272 rejects unsafe production boundary", () => {
  assert.throws(
    () => reconcileDatabaseEvidence({
      scenarioId: "scenario-001",
      syntheticEvidence: evidence,
      databaseEvidence: { ...evidence, productionMutation: true },
    }),
    /UNSAFE_PRODUCTION_BOUNDARY/,
  );
});

test("P10.273 requires every DB proof case", () => {
  const partial = { ...evidence, cases: { TRANSACTION_COMMIT: "PASS" } };
  assert.throws(
    () => reconcileDatabaseEvidence({ scenarioId: "scenario-001", syntheticEvidence: evidence, databaseEvidence: partial }),
    /DATABASE_CASE_NOT_PASS:TRANSACTION_ROLLBACK/,
  );
});

test("P10.274 preserves all required case names", () => {
  const result = reconcileDatabaseEvidence({ scenarioId: "scenario-001", syntheticEvidence: evidence, databaseEvidence: evidence });
  assert.deepEqual(result.cases.map((x) => x.name), Object.keys(cases));
});

test("P10.275 reconciliation fingerprint is deterministic", () => {
  const a = reconcileDatabaseEvidence({ scenarioId: "scenario-001", syntheticEvidence: evidence, databaseEvidence: evidence });
  const b = reconcileDatabaseEvidence({ scenarioId: "scenario-001", syntheticEvidence: evidence, databaseEvidence: evidence });
  assert.equal(a.reconciliationFingerprint, b.reconciliationFingerprint);
});

test("P10.276 production authorization is not implied", () => {
  const result = reconcileDatabaseEvidence({ scenarioId: "scenario-001", syntheticEvidence: evidence, databaseEvidence: evidence });
  assert.equal(result.controls.productionMutation, false);
  assert.equal(result.controls.externalTransport, false);
});
