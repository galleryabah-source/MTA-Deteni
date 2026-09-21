import test from "node:test";
import assert from "node:assert/strict";
import {
  buildControlledRehearsalReport,
  CONTROLLED_REHEARSAL_REPORT_VERSION,
} from "../src/application/testing/controlled-rehearsal-report.mjs";

const base = {
  scenarioId: "scenario-001",
  certificationStatus: "REHEARSAL_CERTIFIED",
  matrixStatus: "PASS",
  evidenceFingerprint: "a".repeat(64),
  productionCertified: false,
  executionAuthorized: false,
};

test("P10.253 report requires rehearsal certification", () => {
  assert.throws(() => buildControlledRehearsalReport({ ...base, certificationStatus: "NOT_CERTIFIED" }), /REHEARSAL_CERTIFICATION_REQUIRED/);
});

test("P10.254 report preserves non-production boundary", () => {
  const report = buildControlledRehearsalReport(base);
  assert.equal(report.controls.syntheticOnly, true);
  assert.equal(report.controls.productionMutation, false);
});

test("P10.255 report cannot imply production certification", () => {
  assert.throws(() => buildControlledRehearsalReport({ ...base, productionCertified: true }), /PRODUCTION_CERTIFICATION_MUST_REMAIN_FALSE/);
});

test("P10.256 report cannot imply execution authorization", () => {
  assert.throws(() => buildControlledRehearsalReport({ ...base, executionAuthorized: true }), /EXECUTION_AUTHORIZATION_MUST_REMAIN_FALSE/);
});

test("P10.257 report fingerprint is deterministic", () => {
  const a = buildControlledRehearsalReport(base);
  const b = buildControlledRehearsalReport(base);
  assert.equal(a.reportFingerprint, b.reportFingerprint);
});

test("P10.258 report contains matrix and evidence references", () => {
  const report = buildControlledRehearsalReport(base);
  assert.equal(report.matrixStatus, "PASS");
  assert.equal(report.evidenceFingerprint.length, 64);
});

test("P10.259 safety controls are fixed by the report contract", () => {
  const report = buildControlledRehearsalReport(base);
  assert.deepEqual(report.controls, {
    syntheticOnly: true,
    migrationFreeze: true,
    aiEnabled: false,
    productionMutation: false,
    externalTransport: false,
    productionCertified: false,
    executionAuthorized: false,
  });
});

test("P10.260 report version is deterministic", () => {
  assert.equal(buildControlledRehearsalReport(base).version, CONTROLLED_REHEARSAL_REPORT_VERSION);
});
