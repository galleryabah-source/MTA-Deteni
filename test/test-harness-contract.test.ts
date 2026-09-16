import test from "node:test";
import assert from "node:assert/strict";
import { assertHarnessObservedPass, validateHarnessEvidence } from "../src/application/test-harness-contract.ts";

const base = {
  schemaVersion: "mta-execution-evidence/v1",
  executionId: "mta-test-001",
  commit: "0123456789abcdef",
  environment: "controlled-nonprod" as const,
  status: "OBSERVED_PASS" as const,
  checks: [
    { controlId: "BUILD-5801", status: "PASS" as const, exitCode: 0 },
    { controlId: "REG-5804", status: "PASS" as const, exitCode: 0 },
  ],
};

test("test harness accepts valid observed pass evidence", () => {
  assert.doesNotThrow(() => assertHarnessObservedPass(base));
});

test("test harness fails closed for incomplete evidence", () => {
  assert.throws(() => assertHarnessObservedPass({ ...base, status: "OBSERVATION_INCOMPLETE" }), /HARNESS_OBSERVATION_INCOMPLETE/);
  assert.throws(() => assertHarnessObservedPass({ ...base, checks: [{ controlId: "REG-5804", status: "FAIL", exitCode: 1 }] }), /HARNESS_OBSERVATION_INCOMPLETE|HARNESS_CHECK_FAILURE/);
});

test("test harness rejects invalid pass exit code", () => {
  assert.throws(() => validateHarnessEvidence({ ...base, checks: [{ controlId: "REG-5804", status: "PASS", exitCode: 1 }] }), /HARNESS_PASS_EXIT_CODE_MISMATCH/);
});
