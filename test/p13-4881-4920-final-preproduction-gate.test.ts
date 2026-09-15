import test from "node:test";
import assert from "node:assert/strict";
import { assertFinalPreproductionGate } from "../src/application/p13-4881-4920-final-preproduction-gate";

test("final pre-production gate requires controlled evidence and keeps production blocked", () => {
  const certificationPackage = {
    certificationId: "CERT-001",
    target: "CONTROLLED_NONPROD" as const,
    finalEvidenceIndex: {
      indexId: "IDX-001",
      links: [{ requirementId: "REQ-1", controlId: "C-1", evidenceId: "E-1", outputIdentity: "O-1", status: "PASS" as const }],
      syntheticOnly: true as const,
      productionAuthorized: false as const,
    },
    observedExecutionComplete: true,
    reportAcceptanceComplete: true,
    lanAcceptanceComplete: true,
    roleJourneyAcceptanceComplete: true,
    recoveryAcceptanceComplete: true,
    migrationFreeze: true as const,
    aiEnabled: false as const,
    productionAuthorized: false as const,
    liveDatabaseApproved: false as const,
  };
  const gate = { certificationPackage, sourceReviewed: true, securityReviewed: true, backupRestoreVerified: true, migrationPlanApproved: true, productionAuthorization: false as const };
  assert.doesNotThrow(() => assertFinalPreproductionGate(gate));
  assert.throws(() => assertFinalPreproductionGate({ ...gate, securityReviewed: false }), /FINAL_PREPRODUCTION_REVIEW_INCOMPLETE/);
});
