import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRuntimeReadiness } from "../src/infrastructure/certification/runtime-readiness-gate.mjs";

const base = {
  kernelCertified: true,
  rehearsalCertified: true,
  databaseBehaviorPass: true,
  evidenceReconciled: true,
  productionMutation: false,
  externalTransport: false,
  executionAuthorized: false,
  productionCertified: false,
};

test("P10.293 accepts complete readiness prerequisites", () => {
  assert.equal(evaluateRuntimeReadiness(base).readiness, "RUNTIME_READINESS_COMPLETE");
});

for (const key of ["kernelCertified","rehearsalCertified","databaseBehaviorPass","evidenceReconciled"]) {
  test(`readiness requires ${key}`, () => {
    assert.throws(
      () => evaluateRuntimeReadiness({ ...base, [key]: false }),
      new RegExp(`READINESS_PREREQUISITE_FAILED:${key}`),
    );
  });
}

test("P10.298 blocks production mutation", () => {
  assert.throws(() => evaluateRuntimeReadiness({ ...base, productionMutation: true }), /PRODUCTION_MUTATION_MUST_REMAIN_FALSE/);
});

test("P10.299 blocks external transport", () => {
  assert.throws(() => evaluateRuntimeReadiness({ ...base, externalTransport: true }), /EXTERNAL_TRANSPORT_MUST_REMAIN_FALSE/);
});

test("P10.300 keeps production authorization disabled", () => {
  const result = evaluateRuntimeReadiness(base);
  assert.equal(result.controls.executionAuthorized, false);
  assert.equal(result.controls.productionCertified, false);
  assert.equal(result.readinessFingerprint.length, 64);
});
