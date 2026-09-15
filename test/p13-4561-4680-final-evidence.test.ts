import test from "node:test";
import assert from "node:assert/strict";
import { assertEvidenceAggregation } from "../src/application/p13-4561-4600-evidence-aggregation";
import { assertReportRenderEvidence } from "../src/application/p13-4601-4640-report-render-evidence";
import { assertFinalEvidenceIndex } from "../src/application/p13-4641-4680-final-evidence-index";

test("evidence aggregation rejects NOT_RUN", () => {
  assert.throws(() => assertEvidenceAggregation([{ evidenceId: "E1", controlId: "C1", status: "NOT_RUN", outputIdentity: "O1" }]), /NOT_CERTIFIED/);
});

test("report rendering requires observable review fingerprints", () => {
  assert.throws(() => assertReportRenderEvidence({ templateId: "T1", artifactId: "A1", sourceSnapshotId: "S1", elementOrderFingerprint: "", geometryFingerprint: "G1", sourceBindingFingerprint: "B1", visuallyReviewed: true }), /FINGERPRINT/);
});

test("final evidence index requires PASS and remains synthetic", () => {
  assert.doesNotThrow(() => assertFinalEvidenceIndex({ indexId: "IDX1", links: [{ requirementId: "R1", controlId: "C1", evidenceId: "E1", outputIdentity: "O1", status: "PASS" }], syntheticOnly: true, productionAuthorized: false }));
  assert.throws(() => assertFinalEvidenceIndex({ indexId: "IDX1", links: [{ requirementId: "R1", controlId: "C1", evidenceId: "E1", outputIdentity: "O1", status: "NOT_RUN" }], syntheticOnly: true, productionAuthorized: false }), /NOT_CERTIFIED/);
});
