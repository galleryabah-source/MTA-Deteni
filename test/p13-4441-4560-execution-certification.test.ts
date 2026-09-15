import test from "node:test";
import assert from "node:assert/strict";
import { assertObservedExecutionManifest } from "../src/application/p13-4441-4480-observed-execution-manifest";
import { assertControlledNonprodCertification } from "../src/application/p13-4481-4520-controlled-nonprod-certification";
import { assertDeploymentReadiness } from "../src/application/p13-4521-4560-deployment-readiness-barrier";

test("observed execution requires successful, identified observations", () => {
  assert.doesNotThrow(() => assertObservedExecutionManifest({
    manifestId: "OBS-001",
    environment: "NONPROD_SYNTHETIC",
    observations: [{ executionId: "EXEC-001", controlId: "CTRL-001", startedAt: "2026-09-15T00:00:00Z", completedAt: "2026-09-15T00:00:01Z", exitCode: 0, outputIdentity: "OUT-001" }],
    syntheticOnly: true,
    productionAuthorized: false,
  }));
});

test("nonprod certification cannot be inferred without observation", () => {
  assert.throws(() => assertControlledNonprodCertification({ certificationId: "CERT-001", target: "CONTROLLED_NONPROD", controls: [{ controlId: "CTRL-001", evidenceId: "EVD-001", observed: false, passed: true }], migrationFreeze: true, aiEnabled: false, productionAuthorized: false, liveDatabaseApproved: false }), /NOT_OBSERVED/);
});

test("deployment remains blocked without production authorization", () => {
  assert.throws(() => assertDeploymentReadiness({ sourceReviewed: true, testsObserved: true, nonprodCertified: true, securityReviewed: true, backupRestoreVerified: true, migrationPlanApproved: true, productionAuthorization: false }), /PRODUCTION_AUTHORIZATION_REQUIRED/);
});
