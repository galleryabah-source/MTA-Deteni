import test from "node:test";
import assert from "node:assert/strict";
import { assertHarnessObservedPass, validateHarnessEvidence } from "../src/application/test-harness-contract.ts";

const canonicalChecks = [
  { controlId: "BUILD-5801", status: "PASS" as const, exitCode: 0 },
  { controlId: "BUILD-5802", status: "PASS" as const, exitCode: 0 },
  { controlId: "BUILD-5803", status: "PASS" as const, exitCode: 0 },
  { controlId: "REG-5804", status: "PASS" as const, exitCode: 0 },
  { controlId: "REG-5805", status: "PASS" as const, exitCode: 0 },
];

const base = {
  schemaVersion: "mta-execution-evidence/v1",
  executionId: "mta-test-001",
  commit: "0123456789abcdef",
  environment: "controlled-nonprod" as const,
  status: "OBSERVED_PASS" as const,
  checks: canonicalChecks,
};

test("test harness accepts the complete canonical observed pass evidence", () => {
  assert.doesNotThrow(() => assertHarnessObservedPass(base));
});

test("test harness fails closed for incomplete evidence", () => {
  assert.throws(() => assertHarnessObservedPass({ ...base, status: "OBSERVATION_INCOMPLETE" }), /HARNESS_OBSERVATION_INCOMPLETE/);
  assert.throws(() => assertHarnessObservedPass({ ...base, checks: canonicalChecks.map((check) => check.controlId === "REG-5804" ? { ...check, status: "FAIL" as const, exitCode: 1 } : check) }), /HARNESS_CHECK_FAILURE/);
});

test("test harness rejects missing, duplicate and non-canonical controls", () => {
  assert.throws(() => validateHarnessEvidence({ ...base, checks: canonicalChecks.slice(0, 4) }), /HARNESS_CHECKS_REQUIRED/);
  assert.throws(() => validateHarnessEvidence({ ...base, checks: [...canonicalChecks.slice(0, 4), { ...canonicalChecks[0], controlId: "BUILD-5801" }] }), /HARNESS_DUPLICATE_CONTROL_ID/);
  assert.throws(() => validateHarnessEvidence({ ...base, checks: [...canonicalChecks.slice(0, 4), { controlId: "FAKE-9999", status: "PASS", exitCode: 0 }] }), /HARNESS_REQUIRED_CONTROL_MISSING:REG-5805/);
});

test("test harness rejects invalid pass exit code", () => {
  assert.throws(() => validateHarnessEvidence({ ...base, checks: canonicalChecks.map((check) => check.controlId === "REG-5804" ? { ...check, exitCode: 1 } : check) }), /HARNESS_PASS_EXIT_CODE_MISMATCH/);
});
