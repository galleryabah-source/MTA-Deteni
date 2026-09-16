import test from "node:test";
import assert from "node:assert/strict";
import { certifyP9Ci, certifyP9CiFromHarness } from "../src/application/p9-ci-certification.ts";

test("P9.12 certifies a complete observed controlled-nonprod harness", () => {
  const evidence = {
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
  };
  assert.equal(certifyP9CiFromHarness(evidence), "CERTIFIED");
});

test("P9.12 does not certify incomplete or wrong-environment evidence", () => {
  assert.throws(() => certifyP9CiFromHarness({
    schemaVersion: "mta-execution-evidence/v1",
    executionId: "mta-test-013",
    commit: "0123456789abcdef",
    environment: "controlled-nonprod",
    status: "OBSERVATION_INCOMPLETE",
    checks: [{ controlId: "BUILD-5801", status: "PASS", exitCode: 0 }],
  }), /HARNESS_OBSERVATION_INCOMPLETE/);
  assert.equal(certifyP9Ci({ commit: "0123456789abcdef", environment: "production", status: "OBSERVED_PASS", artifactAvailable: true }), "NOT_CERTIFIED");
});
