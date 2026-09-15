import test from "node:test";
import assert from "node:assert/strict";
import {
  createSyntheticReleaseCheck,
  evaluateBoundaryAudit,
  evaluateReleaseCandidate,
  type ReleaseCandidateMatrix,
} from "../src/application/release-candidate.js";

test("P10.905 synthetic release matrix is ready only with PASS evidence", () => {
  const matrix: ReleaseCandidateMatrix = {
    matrixId: "RC-SYN-001",
    target: "SYNTHETIC",
    checks: [
      createSyntheticReleaseCheck("P10.905", "ui-boundary"),
      createSyntheticReleaseCheck("P10.912", "qr-context"),
      createSyntheticReleaseCheck("P10.920", "report-snapshot"),
      createSyntheticReleaseCheck("P10.928", "workflow-authority"),
    ],
  };
  assert.equal(evaluateReleaseCandidate(matrix), "READY");
});

test("release matrix fails closed on missing evidence or target mismatch", () => {
  const blocked = {
    matrixId: "RC-BLOCKED",
    target: "SYNTHETIC" as const,
    checks: [createSyntheticReleaseCheck("P10.905", "missing", "NOT_RUN")],
  };
  assert.equal(evaluateReleaseCandidate(blocked), "BLOCKED");

  const mixed = {
    matrixId: "RC-MIXED",
    target: "NON_PRODUCTION" as const,
    checks: [createSyntheticReleaseCheck("P10.905", "synthetic-only")],
  };
  assert.equal(evaluateReleaseCandidate(mixed), "BLOCKED");
});

test("pre-authorisation boundary audit is pass only when all safety invariants hold", () => {
  assert.equal(evaluateBoundaryAudit({
    target: "SYNTHETIC",
    migrationFreeze: true,
    aiEnabled: false,
    productionAccess: false,
    directOperationalMutation: false,
    realPiiPresent: false,
    findings: [],
  }), "PASS");

  assert.equal(evaluateBoundaryAudit({
    target: "SYNTHETIC",
    migrationFreeze: true,
    aiEnabled: false,
    productionAccess: false,
    directOperationalMutation: false,
    realPiiPresent: false,
    findings: ["UNRESOLVED_BOUNDARY"],
  }), "BLOCKED");
});
