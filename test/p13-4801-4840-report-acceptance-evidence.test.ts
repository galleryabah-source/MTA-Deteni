import test from "node:test";
import assert from "node:assert/strict";
import { assertReportAcceptanceEvidence } from "../src/application/p13-4801-4840-report-acceptance-evidence";

test("report acceptance evidence requires observed visual and source fidelity", () => {
  const evidence = {
    templateId: "LAP-HARIAN-REGU",
    artifactId: "ART-001",
    sourceSnapshotId: "SNAP-001",
    sourceBindingsReconciled: true,
    deterministicArtifact: true,
    elementOrderFingerprint: "ORDER-001",
    geometryFingerprint: "GEOM-001",
    sourceBindingFingerprint: "BIND-001",
    visuallyReviewed: true,
    approvedTemplateAvailable: true,
    observed: true,
  };
  assert.doesNotThrow(() => assertReportAcceptanceEvidence(evidence));
  assert.throws(() => assertReportAcceptanceEvidence({ ...evidence, observed: false }), /REPORT_ACCEPTANCE_NOT_OBSERVED/);
  assert.throws(() => assertReportAcceptanceEvidence({ ...evidence, geometryFingerprint: "" }), /REPORT_ACCEPTANCE_FINGERPRINT_REQUIRED/);
});
