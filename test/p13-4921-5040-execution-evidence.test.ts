import test from "node:test";
import assert from "node:assert/strict";
import { assertControlledExecutionPlan, assertExecutionPlanCertified } from "../src/application/p13-4921-4960-controlled-execution-plan";
import { assertEvidenceCoverage, assertNoUnexpectedObservedControls } from "../src/application/p13-4961-5000-execution-evidence-coverage";
import { deriveFinalEvidenceStatus } from "../src/application/p13-5001-5040-final-evidence-status";

const plan = {
  planId: "EXEC-001",
  environment: "CONTROLLED_NONPROD" as const,
  items: [
    { stage: "TEST_SUITE" as const, controlId: "TEST-ALL", requiredObservation: "typecheck and tests", evidenceId: "E-TEST", status: "PASS" as const },
    { stage: "RUNTIME" as const, controlId: "RUN-LOCAL", requiredObservation: "local runtime health", evidenceId: "E-RUN", status: "PASS" as const },
    { stage: "BROWSER" as const, controlId: "BROWSER-SMOKE", requiredObservation: "browser smoke", evidenceId: "E-BROWSER", status: "PASS" as const },
    { stage: "LAN" as const, controlId: "LAN-SMOKE", requiredObservation: "LAN continuity", evidenceId: "E-LAN", status: "PASS" as const },
    { stage: "REPORT" as const, controlId: "REPORT-RENDER", requiredObservation: "approved report render", evidenceId: "E-REPORT", status: "PASS" as const },
    { stage: "RECOVERY" as const, controlId: "RECOVERY-DRILL", requiredObservation: "backup restore rehearsal", evidenceId: "E-RECOVERY", status: "PASS" as const },
    { stage: "SECURITY" as const, controlId: "SECURITY-REVIEW", requiredObservation: "security review", evidenceId: "E-SECURITY", status: "PASS" as const },
  ],
  syntheticOnly: true as const,
  productionAuthorized: false as const,
};

test("controlled execution plan defines all mandatory observation stages", () => {
  assert.doesNotThrow(() => assertControlledExecutionPlan(plan));
  assert.doesNotThrow(() => assertExecutionPlanCertified(plan));
});

test("evidence coverage rejects missing or unexpected controls", () => {
  const expected = plan.items.map((item) => item.controlId);
  assert.doesNotThrow(() => assertEvidenceCoverage(plan, { planId: plan.planId, expectedControlIds: expected, observedControlIds: expected }));
  assert.throws(() => assertEvidenceCoverage(plan, { planId: plan.planId, expectedControlIds: expected, observedControlIds: expected.slice(0, -1) }), /EVIDENCE_COVERAGE_MISSING/);
  assert.throws(() => assertNoUnexpectedObservedControls(plan, { planId: plan.planId, expectedControlIds: expected, observedControlIds: [...expected, "UNEXPECTED"] }), /EVIDENCE_COVERAGE_UNEXPECTED/);
});

test("final evidence status distinguishes pending observation from certification", () => {
  assert.equal(deriveFinalEvidenceStatus({ contractReady: true, allRequiredControlsObserved: false, allRequiredControlsPassed: false, productionAuthorized: false }), "OBSERVATION_PENDING");
  assert.equal(deriveFinalEvidenceStatus({ contractReady: true, allRequiredControlsObserved: true, allRequiredControlsPassed: false, productionAuthorized: false }), "OBSERVATION_INCOMPLETE");
  assert.equal(deriveFinalEvidenceStatus({ contractReady: true, allRequiredControlsObserved: true, allRequiredControlsPassed: true, productionAuthorized: false }), "CERTIFIED");
});
