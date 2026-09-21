import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRehearsalEvidenceRecord,
  verifyRehearsalEvidenceRecord,
} from "../src/infrastructure/certification/rehearsal-evidence-integrity.mjs";
import {
  decideRehearsalCertification,
  REHEARSAL_CERTIFICATION_VERSION,
} from "../src/infrastructure/certification/rehearsal-certification-decision.mjs";

const baseEvidence = {
  scenarioId: "scenario-001",
  matrixFingerprint: "a".repeat(64),
  classification: "PASS",
  syntheticOnly: true,
  productionMutation: false,
  externalTransport: false,
};

const passingDecision = {
  matrixPass: true,
  evidenceIntegrityPass: true,
  scenarioEvidencePass: true,
  dryRunReadinessPass: true,
  governedGatePass: true,
  syntheticOnly: true,
  migrationFreeze: true,
  aiDisabled: true,
  productionMutationFalse: true,
  externalTransportFalse: true,
};

test("P10.245 evidence record is deterministic and integrity-verifiable", () => {
  const a = buildRehearsalEvidenceRecord(baseEvidence);
  const b = buildRehearsalEvidenceRecord(baseEvidence);
  assert.equal(a.evidenceFingerprint, b.evidenceFingerprint);
  assert.equal(verifyRehearsalEvidenceRecord(a), true);
});

test("P10.246 tampered evidence is rejected", () => {
  const record = buildRehearsalEvidenceRecord(baseEvidence);
  assert.equal(verifyRehearsalEvidenceRecord({ ...record, classification: "FAIL" }), false);
});

test("P10.247 unsafe evidence cannot be constructed", () => {
  assert.throws(() => buildRehearsalEvidenceRecord({ ...baseEvidence, productionMutation: true }), /PRODUCTION_MUTATION_MUST_BE_FALSE/);
  assert.throws(() => buildRehearsalEvidenceRecord({ ...baseEvidence, externalTransport: true }), /EXTERNAL_TRANSPORT_MUST_BE_FALSE/);
});

test("P10.248 incomplete matrix fingerprint is rejected", () => {
  assert.throws(() => buildRehearsalEvidenceRecord({ ...baseEvidence, matrixFingerprint: "short" }), /MATRIX_FINGERPRINT_INVALID/);
});

test("P10.249 certification is fail-closed", () => {
  assert.equal(decideRehearsalCertification({ ...passingDecision, matrixPass: false }).status, "NOT_CERTIFIED");
});

test("P10.250 every prerequisite is required", () => {
  for (const key of Object.keys(passingDecision)) {
    assert.equal(decideRehearsalCertification({ ...passingDecision, [key]: false }).status, "NOT_CERTIFIED", key);
  }
});

test("P10.251 rehearsal certification never becomes production certification", () => {
  const result = decideRehearsalCertification(passingDecision);
  assert.equal(result.status, "REHEARSAL_CERTIFIED");
  assert.equal(result.productionCertified, false);
  assert.equal(result.executionAuthorized, false);
});

test("P10.252 certification version is deterministic", () => {
  assert.equal(decideRehearsalCertification(passingDecision).version, REHEARSAL_CERTIFICATION_VERSION);
});
