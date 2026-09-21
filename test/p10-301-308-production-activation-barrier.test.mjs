import test from "node:test";
import assert from "node:assert/strict";
import { evaluateProductionActivation } from "../src/infrastructure/certification/production-activation-barrier.mjs";

const base = Object.fromEntries([
  "runtimeReadinessComplete",
  "operatorApproval",
  "changeWindowOpen",
  "rollbackPlanVerified",
  "observabilityReady",
  "backupVerified",
  "securityGatePassed",
  "artifactIntegrityPassed",
].map((x) => [x, true]));

test("P10.301 blocks activation without runtime readiness", () => {
  const result = evaluateProductionActivation({ ...base, runtimeReadinessComplete: false });
  assert.equal(result.status, "ACTIVATION_BLOCKED");
  assert.match(result.reason, /runtimeReadinessComplete/);
});

test("P10.302 requires operator approval", () => {
  const result = evaluateProductionActivation({ ...base, operatorApproval: false });
  assert.equal(result.status, "ACTIVATION_BLOCKED");
});

test("P10.303 requires change window", () => {
  const result = evaluateProductionActivation({ ...base, changeWindowOpen: false });
  assert.equal(result.status, "ACTIVATION_BLOCKED");
});

test("P10.304 requires rollback verification", () => {
  const result = evaluateProductionActivation({ ...base, rollbackPlanVerified: false });
  assert.equal(result.status, "ACTIVATION_BLOCKED");
});

test("P10.305 requires observability readiness", () => {
  const result = evaluateProductionActivation({ ...base, observabilityReady: false });
  assert.equal(result.status, "ACTIVATION_BLOCKED");
});

test("P10.306 requires backup verification", () => {
  const result = evaluateProductionActivation({ ...base, backupVerified: false });
  assert.equal(result.status, "ACTIVATION_BLOCKED");
});

test("P10.307 requires security and artifact gates", () => {
  assert.equal(evaluateProductionActivation({ ...base, securityGatePassed: false }).status, "ACTIVATION_BLOCKED");
  assert.equal(evaluateProductionActivation({ ...base, artifactIntegrityPassed: false }).status, "ACTIVATION_BLOCKED");
});

test("P10.308 never grants authorization implicitly", () => {
  const result = evaluateProductionActivation(base);
  assert.equal(result.status, "ACTIVATION_READY_FOR_SEPARATE_GOVERNED_DECISION");
  assert.equal(result.executionAuthorized, false);
  assert.equal(result.productionCertified, false);
});
