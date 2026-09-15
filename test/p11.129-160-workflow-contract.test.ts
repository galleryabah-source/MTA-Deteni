import assert from "node:assert/strict";
import test from "node:test";
import { defaultTemporaryExitWorkflow, validateWorkflowContract } from "../src/application/p11-129-160-workflow-contract.js";

test("P11.129-160 preserves temporary-exit domain ownership sequence", () => {
  const steps = defaultTemporaryExitWorkflow();
  assert.equal(validateWorkflowContract({ contractId: "WF-001", target: "SYNTHETIC", steps }), "READY");
  assert.deepEqual(steps.map((step) => step.domain), ["RAP", "KAMTIB", "LEADERSHIP", "SUBBAG_TU"]);
});

test("P11.129-160 blocks owner-order drift", () => {
  const steps = defaultTemporaryExitWorkflow();
  assert.equal(validateWorkflowContract({ contractId: "WF-002", target: "SYNTHETIC", steps: [{ ...steps[1] }, ...steps.slice(1)] }), "BLOCKED");
});
