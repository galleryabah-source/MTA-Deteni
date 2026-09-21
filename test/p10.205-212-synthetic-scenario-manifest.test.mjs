import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSyntheticScenarioManifest,
  validateSyntheticScenarioManifest,
  REQUIRED_STEPS,
} from "../src/application/testing/synthetic-scenario-manifest.mjs";

const input = {
  scenarioId: "scenario-001",
  subjectId: "synthetic-detainee-001",
  requestId: "req-001",
  correlationId: "corr-001",
  syntheticOnly: true,
  migrationFreeze: true,
  aiEnabled: false,
  steps: REQUIRED_STEPS.map((type, i) => ({
    stepId: `step-${String(i + 1).padStart(2, "0")}`,
    type,
    subjectId: "synthetic-detainee-001",
    sourceId: `source-${i + 1}`,
  })),
};

test("P10.205 scenario is explicitly synthetic and safety locked", () => {
  const manifest = buildSyntheticScenarioManifest(input);
  assert.equal(manifest.invariants.productionMutation, false);
  assert.equal(manifest.invariants.externalTransport, false);
});

test("P10.206 full temporary-exit sequence is ordered", () => {
  const manifest = buildSyntheticScenarioManifest(input);
  assert.deepEqual(manifest.steps.map((x) => x.type), REQUIRED_STEPS);
});

test("P10.207 duplicate step identity is rejected", () => {
  const steps = [...input.steps];
  steps[1] = { ...steps[1], stepId: steps[0].stepId };
  assert.throws(() => buildSyntheticScenarioManifest({ ...input, steps }), /SCENARIO_STEP_ID_DUPLICATE/);
});

test("P10.208 cross-step subject mismatch is rejected", () => {
  const steps = [...input.steps];
  steps[4] = { ...steps[4], subjectId: "other-subject" };
  assert.throws(() => buildSyntheticScenarioManifest({ ...input, steps }), /SCENARIO_SUBJECT_MISMATCH/);
});

test("P10.209 malformed order is rejected", () => {
  const steps = [...input.steps];
  [steps[0], steps[1]] = [steps[1], steps[0]];
  assert.throws(() => buildSyntheticScenarioManifest({ ...input, steps }), /SCENARIO_STEP_ORDER_INVALID/);
});

test("P10.210 manifest fingerprint is deterministic", () => {
  const a = buildSyntheticScenarioManifest(input);
  const b = buildSyntheticScenarioManifest(input);
  assert.equal(a.manifestFingerprint, b.manifestFingerprint);
});

test("P10.211 tampered manifest fails validation", () => {
  const manifest = buildSyntheticScenarioManifest(input);
  assert.equal(validateSyntheticScenarioManifest({ ...manifest, correlationId: "tampered" }), false);
});

test("P10.212 audit/outbox and publication boundaries are explicit", () => {
  const manifest = buildSyntheticScenarioManifest(input);
  assert.equal(manifest.invariants.auditRequired, true);
  assert.equal(manifest.invariants.outboxRequired, true);
  assert.equal(manifest.invariants.durablePublication, false);
});
