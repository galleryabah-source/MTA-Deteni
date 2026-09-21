import test from "node:test";
import assert from "node:assert/strict";
import { buildProductionReadinessEvidence } from "../src/infrastructure/certification/production-readiness-evidence.mjs";

const base = {
  kernelCertification: "CERTIFIED",
  rehearsalCertification: "REHEARSAL_CERTIFIED",
  databaseEvidence: { status: "POSTGRES_BEHAVIOR_PASS" },
  reconciliation: { status: "DB_EVIDENCE_RECONCILED" },
};

test("P10.285 requires kernel certification", () => {
  assert.throws(() => buildProductionReadinessEvidence({ ...base, kernelCertification: "NOT_CERTIFIED" }), /KERNEL_CERTIFICATION_REQUIRED/);
});
test("P10.286 requires rehearsal certification", () => {
  assert.throws(() => buildProductionReadinessEvidence({ ...base, rehearsalCertification: "NOT_CERTIFIED" }), /REHEARSAL_CERTIFICATION_REQUIRED/);
});
test("P10.287 requires PostgreSQL behavior PASS", () => {
  assert.throws(() => buildProductionReadinessEvidence({ ...base, databaseEvidence: { status: "POSTGRES_BEHAVIOR_FAIL" } }), /DATABASE_BEHAVIOR_PASS_REQUIRED/);
});
test("P10.288 requires evidence reconciliation", () => {
  assert.throws(() => buildProductionReadinessEvidence({ ...base, reconciliation: { status: "RECONCILIATION_FAIL" } }), /DB_EVIDENCE_RECONCILIATION_REQUIRED/);
});
test("P10.289 produces complete readiness evidence", () => {
  assert.equal(buildProductionReadinessEvidence(base).status, "READINESS_EVIDENCE_COMPLETE");
});
test("P10.290 readiness fingerprint is deterministic", () => {
  const a = buildProductionReadinessEvidence(base);
  const b = buildProductionReadinessEvidence(base);
  assert.equal(a.evidenceFingerprint, b.evidenceFingerprint);
});
test("P10.291 production authorization remains false", () => {
  const result = buildProductionReadinessEvidence(base);
  assert.equal(result.controls.productionCertified, false);
  assert.equal(result.controls.executionAuthorized, false);
});
test("P10.292 production mutation and external transport remain false", () => {
  const result = buildProductionReadinessEvidence(base);
  assert.equal(result.controls.productionMutation, false);
  assert.equal(result.controls.externalTransport, false);
});
