import test from "node:test";
import assert from "node:assert/strict";
import { certifyP9Ci, certifyP9CiFromHarness } from "../src/application/p9-ci-certification.ts";

const canonicalEvidence = () => ({
  schemaVersion: "mta-execution-evidence/v1",
  executionId: "mta-test-012",
  commit: "0123456789abcdef0123456789abcdef01234567",
  environment: "controlled-nonprod" as const,
  status: "OBSERVED_PASS" as const,
  checks: [
    { controlId: "BUILD-5801", status: "PASS" as const, exitCode: 0 },
    { controlId: "BUILD-5802", status: "PASS" as const, exitCode: 0 },
    { controlId: "BUILD-5803", status: "PASS" as const, exitCode: 0 },
    { controlId: "REG-5804", status: "PASS" as const, exitCode: 0 },
    { controlId: "REG-5805", status: "PASS" as const, exitCode: 0 },
  ],
});

test("P9.12 certifies a complete observed controlled-nonprod harness", () => {
  const evidence = canonicalEvidence();
  assert.equal(certifyP9CiFromHarness(evidence), "CERTIFIED");
  assert.equal(certifyP9Ci({ harnessEvidence: evidence }), "CERTIFIED");
});

test("P9.12 rejects incomplete harness evidence", () => {
  assert.throws(() => certifyP9CiFromHarness({
    schemaVersion: "mta-execution-evidence/v1",
    executionId: "mta-test-013",
    commit: "0123456789abcdef",
    environment: "controlled-nonprod",
    status: "OBSERVATION_INCOMPLETE",
    checks: [{ controlId: "BUILD-5801", status: "PASS", exitCode: 0 }],
  }), /HARNESS_OBSERVATION_INCOMPLETE/);
});

test("P9.12 rejects wrong-environment harness evidence", () => {
  const evidence = canonicalEvidence();
  assert.throws(() => certifyP9Ci({
    harnessEvidence: { ...evidence, environment: "production" },
  }), /HARNESS_ENVIRONMENT_INVALID/);
});

test("P9.12 rejects forged summary-only certification input", () => {
  assert.throws(() => certifyP9Ci({
    commit: "0123456789abcdef",
    environment: "controlled-nonprod",
    status: "OBSERVED_PASS",
    artifactAvailable: true,
  } as never), /HARNESS/);
});
