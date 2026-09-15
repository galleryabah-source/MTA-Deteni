import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReleaseGate } from "../src/application/p12-1281-1320-release-gate.js";
import { validateOperatorSurfaceAction } from "../src/application/p12-1321-1360-operator-surface-contract.js";

const base = { syntheticOnly: true, migrationFreeze: true, aiEnabled: false, productionAuthorized: false, reconciliationMatched: true, workflowApproved: true, executionCertified: true } as const;

test("release gate requires every safety and certification condition", () => {
  assert.equal(evaluateReleaseGate(base), "READY");
  assert.equal(evaluateReleaseGate({ ...base, executionCertified: false }), "BLOCKED");
  assert.equal(evaluateReleaseGate({ ...base, productionAuthorized: true }), "BLOCKED");
});

test("operator surface preserves correlation identity", () => {
  const actor = { actorId: "ACT-SYN", role: "OPERATOR", domain: "KAMTIB" as const, scope: {}, correlationId: "CORR-SYN" };
  validateOperatorSurfaceAction({ actionId: "ACTN-SYN", actor, permission: "HEADCOUNT_CAPTURE", aggregateId: "AGG-SYN", detaineeId: "DET-SYN", correlationId: "CORR-SYN" });
  assert.throws(() => validateOperatorSurfaceAction({ actionId: "ACTN-SYN", actor, permission: "HEADCOUNT_CAPTURE", aggregateId: "AGG-SYN", detaineeId: "DET-SYN", correlationId: "CORR-DRIFT" }), /OPERATOR_SURFACE_CORRELATION_MISMATCH/);
});
