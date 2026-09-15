import test from "node:test";
import assert from "node:assert/strict";
import { assertIntegratedExecutionComplete } from "../src/application/p13-4201-4240-integrated-execution-harness";
import { assertReportRenderingVerified } from "../src/application/p13-4241-4280-report-rendering-verification";
import { assertRoleJourneyMatrix, assertDenyByDefault } from "../src/application/p13-4281-4320-role-journey-matrix";
import { assertOfflineContinuityDrillComplete } from "../src/application/p13-4321-4360-offline-continuity-drill";
import { assertReleaseEvidenceManifestComplete } from "../src/application/p13-4361-4400-release-evidence-manifest";
import { assertIntegratedPreReleaseReady } from "../src/application/p13-4401-4440-integrated-pre-release-gate";

test("P13.4201-4440 accepts a complete synthetic release evidence chain", () => {
  assertIntegratedExecutionComplete({ executionId: "exec-001", syntheticOnly: true, productionAuthorized: false, liveDatabaseApproved: false, controls: [{ controlId: "CTRL-1", prerequisite: "pre-gates", executed: true, passed: true, outputIdentity: "out-001" }] });
  assertReportRenderingVerified({ verificationId: "render-001", templateId: "laporan-harian-regu-jaga", format: "PDF", templateApproved: true, sourceBindingsReconciled: true, deterministicArtifact: true, elements: [{ elementKey: "header", order: 1, sourceField: "report.title", expectedValue: "Laporan Harian", renderedValue: "Laporan Harian", geometryFingerprint: "geom-001" }] });
  assertRoleJourneyMatrix([{ caseId: "journey-1", role: "HEAD_RUDENIM", capability: "OVERSIGHT", allowed: true, observedOutcome: "ALLOWED", evidenceId: "ev-role-1" }, { caseId: "journey-2", role: "HEAD_RUDENIM", capability: "MUTATE", allowed: false, observedOutcome: "DENIED", evidenceId: "ev-role-2" }]);
  assertDenyByDefault(false, false);
  assertOfflineContinuityDrillComplete({ drillId: "drill-001", localServerReady: true, lanClientsTrusted: true, offlineReadOnly: true, replayOrdered: true, conflictsHumanReviewed: true, revokedDeviceRejected: true, restoreVerified: true, syntheticOnly: true, productionAuthorized: false, steps: [{ stepId: "offline", name: "offline read-only", executed: true, passed: true, evidenceId: "ev-offline" }] });
  assertReleaseEvidenceManifestComplete({ manifestId: "manifest-001", syntheticOnly: true, productionAuthorized: false, items: [{ requirementId: "REQ-1", contractId: "CON-1", evidenceId: "EV-1", outputIdentity: "OUT-1", telemetryIdentity: "TEL-1", status: "PASS" }] });
  assertIntegratedPreReleaseReady({ integratedExecution: true, reportRenderingVerification: true, roleJourneyMatrix: true, offlineContinuityDrill: true, evidenceManifest: true, migrationFreeze: true, aiEnabled: false, productionAuthorized: false, liveDatabaseApproved: false });
});

test("P13.4201-4440 rejects unsafe pre-release state", () => {
  assert.throws(() => assertIntegratedPreReleaseReady({ integratedExecution: true, reportRenderingVerification: true, roleJourneyMatrix: true, offlineContinuityDrill: true, evidenceManifest: true, migrationFreeze: true, aiEnabled: false, productionAuthorized: true, liveDatabaseApproved: false }), /PRE_RELEASE_GOVERNANCE_BLOCKED/);
  assert.throws(() => assertDenyByDefault(true, false), /ROLE_CAPABILITY_DENY_BY_DEFAULT_VIOLATION/);
});
