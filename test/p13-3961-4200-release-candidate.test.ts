import { strict as assert } from "node:assert";
import { assertSyntheticHarnessComplete } from "../src/application/p13-3961-4000-executable-synthetic-harness.js";
import { assertShellContract } from "../src/application/p13-4001-4040-shell-contract-convergence.js";
import { assertReportTemplateExecutionReady } from "../src/application/p13-4041-4080-report-template-execution-boundary.js";
import { assertReleaseCandidateTraceability } from "../src/application/p13-4081-4120-release-candidate-traceability.js";
import { assertReleaseCandidateGovernance } from "../src/application/p13-4121-4160-release-candidate-governance.js";
import { assertReleaseCandidateReady } from "../src/application/p13-4161-4200-release-candidate-gate.js";

assertSyntheticHarnessComplete({ harnessId: "H-1", controls: [{ controlId: "C1", name: "journey", executed: true, passed: true, outputIdentity: "OUT-1" }], syntheticOnly: true, productionAuthorized: false });
assertShellContract({ surface: "DASHBOARD", requiresAuthorization: true, responsive: true, offlineAware: true, syntheticSafe: true });
assertReportTemplateExecutionReady({ templateId: "daily-guard", format: "PDF", sourceSnapshotId: "SNAP-1", exactLayoutRequired: true, sourceBindingsReconciled: true, deterministicArtifact: true, approvedTemplateAvailable: true });
assertReleaseCandidateTraceability([{ requirementId: "REQ-1", contractId: "C1", evidenceId: "E1", outputIdentity: "OUT-1" }]);
assertReleaseCandidateGovernance({ syntheticOnly: true, migrationFreeze: true, aiEnabled: false, productionAuthorized: false, liveDatabaseApproved: false, traceabilityComplete: true, harnessEvidenceComplete: true, reportBoundaryComplete: true });
assertReleaseCandidateReady({ syntheticJourney: true, harnessExecuted: true, shellConverged: true, reportExecutionBoundaryReady: true, traceabilityComplete: true, governanceSafe: true });
assert.throws(() => assertReleaseCandidateReady({ syntheticJourney: true, harnessExecuted: false, shellConverged: true, reportExecutionBoundaryReady: true, traceabilityComplete: true, governanceSafe: true }), /RELEASE_CANDIDATE_NOT_READY/);
