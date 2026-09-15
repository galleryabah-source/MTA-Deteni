import test from "node:test";
import assert from "node:assert/strict";
import { assertControlledCertificationPackage } from "../src/application/p13-4841-4880-controlled-certification-package";

test("controlled certification remains blocked until all evidence domains are complete", () => {
  const base = {
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
  assert.doesNotThrow(() => assertControlledCertificationPackage(base));
  assert.throws(() => assertControlledCertificationPackage({ ...base, recoveryAcceptanceComplete: false }), /CONTROLLED_CERTIFICATION_EVIDENCE_INCOMPLETE/);
  assert.throws(() => assertControlledCertificationPackage({ ...base, productionAuthorized: true }), /CONTROLLED_CERTIFICATION_GOVERNANCE_BLOCKED/);
});
