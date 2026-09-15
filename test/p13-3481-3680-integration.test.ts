import { strict as assert } from "node:assert";
import { assertSyntheticJourneyComplete } from "../src/application/p13-3481-3520-synthetic-journey-composition.js";
import { createDeterministicReportArtifact, assertReportArtifactsDeterministic } from "../src/application/p13-3521-3560-report-artifact-determinism.js";
import { assertRolePermissionRegression, assertLeadershipOversightExpectation } from "../src/application/p13-3561-3600-role-permission-regression.js";
import { assertOfflineOnlineReconciliation } from "../src/application/p13-3601-3640-offline-online-reconciliation.js";
import { assertCertificationEvidencePackage } from "../src/application/p13-3641-3680-certification-evidence-packaging.js";

assertSyntheticJourneyComplete({ journeyId: "J-1", steps: [{ stepId: "S1", name: "synthetic journey", completed: true, evidenceId: "E1" }], syntheticOnly: true, productionAuthorized: false });
const input = { templateId: "daily-guard", sourceSnapshotId: "SNAP-1", orderedFields: ["title", "date", "regu"] } as const;
const artifactA = createDeterministicReportArtifact(input);
const artifactB = createDeterministicReportArtifact(input);
assertReportArtifactsDeterministic(artifactA, artifactB);
assertRolePermissionRegression([{ role: "AUDITOR", capability: "OVERSIGHT_READ", allowed: true }, { role: "AUDITOR", capability: "REPORT_GENERATE", allowed: false }, { role: "REVIEWER", capability: "REPORT_GENERATE", allowed: true }]);
assertLeadershipOversightExpectation({ role: "OWNER", capability: "OVERSIGHT_DIRECTIVE", allowed: true });
assertOfflineOnlineReconciliation([{ recordId: "R1", localVersion: 2, canonicalVersion: 2, operationFingerprint: "fp", canonicalFingerprint: "fp" }]);
assertCertificationEvidencePackage({ packageId: "PKG-1", evidence: [{ evidenceId: "E1", controlId: "C1", source: "TEST", status: "PASS", outputIdentity: "test-output-1" }], syntheticOnly: true, productionAuthorized: false });
assert.throws(() => assertCertificationEvidencePackage({ packageId: "PKG-2", evidence: [{ evidenceId: "E2", controlId: "C2", source: "TEST", status: "NOT_RUN", outputIdentity: "" }], syntheticOnly: true, productionAuthorized: false }), /CERT_EVIDENCE_IDENTITY_REQUIRED/);
