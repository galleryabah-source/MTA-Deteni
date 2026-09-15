import test from "node:test";
import assert from "node:assert/strict";
import { assertIntegratedAcceptancePackage } from "../src/application/p13-4681-4720-integrated-acceptance-orchestrator";

test("integrated acceptance orchestrator requires every control to be PASS", () => {
  const base = {
    package: {
      packageId: "PKG-SYN-001",
      controls: [{ controlId: "C-APP", domain: "APPLICATION" as const, evidenceId: "E-APP", outputIdentity: "O-APP", status: "PASS" as const }],
      syntheticOnly: true as const,
      productionAuthorized: false as const,
    },
    evidence: [{ evidenceId: "E-APP", controlId: "C-APP", status: "PASS" as const, outputIdentity: "O-APP" }],
    reportRender: {
      templateId: "TPL-001",
      artifactId: "ART-001",
      sourceSnapshotId: "SNAP-001",
      elementOrderFingerprint: "ORDER-001",
      geometryFingerprint: "GEOM-001",
      sourceBindingFingerprint: "BIND-001",
      visuallyReviewed: true,
    },
    journey: {
      journeyId: "J-001",
      steps: [{ stepId: "S-001", name: "acceptance", completed: true, evidenceId: "E-APP" }],
      syntheticOnly: true as const,
      productionAuthorized: false as const,
    },
    finalIndex: {
      indexId: "IDX-001",
      links: [{ requirementId: "REQ-001", controlId: "C-APP", evidenceId: "E-APP", outputIdentity: "O-APP", status: "PASS" as const }],
      syntheticOnly: true as const,
      productionAuthorized: false as const,
    },
  };

  assert.doesNotThrow(() => assertIntegratedAcceptancePackage(base));
  assert.throws(() => assertIntegratedAcceptancePackage({ ...base, package: { ...base.package, controls: [{ ...base.package.controls[0], status: "NOT_RUN" as const }] } }), /INTEGRATED_ACCEPTANCE_CONTROL_NOT_CERTIFIED/);
  assert.throws(() => assertIntegratedAcceptancePackage({ ...base, reportRender: { ...base.reportRender, visuallyReviewed: false } }), /REPORT_RENDER_VISUAL_REVIEW_REQUIRED/);
});
