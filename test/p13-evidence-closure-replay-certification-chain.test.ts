import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-certification.js";

const evidenceCertification = {
  certificationId:"EVCERT-20320",
  evidenceId:"TERMINAL-EVID-20320",
  integrityCertificationId:"RCLOSEINTCERT-20320",
  integrityId:"RCLOSEINT-20320",
  closureCertificationId:"RCPTCLOSECERT-20320",
  closureId:"RCPTCLOSE-20320",
  receiptId:"RCPT-20320",
  decisionCertificationId:"DECCERT-20320",
  decisionId:"DEC-20320",
  decisionFingerprint:"FP-20320",
  evidenceState:"READY_FOR_REVIEW",
  authorizationGranted:false,
  dispatchApproved:false,
  externalTransportRequested:false,
  dispatchExecuted:false,
  durablePublicationCreated:false,
  syntheticOnly:true,
  replayDisposition:"ADMIT",
  certified:true
} as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceCertification;

test("P13.20321-20640 preserves evidence-closure replay and certification continuity", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    closureId:"EVCLOSE-20320",
    evidenceCertification
  });

  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    closure,evidenceCertification
  }),"ADMIT");

  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    closure,evidenceCertification
  }),"REPLAY");

  const certified = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    certificationId:"EVCLOSECERT-20320",
    closure,
    evidenceCertification
  });

  assert.equal(certified.certified,true);
  assert.equal(certified.replayDisposition,"REPLAY");
  assert.equal(certified.closureState,"CLOSED_FOR_REVIEW");
  assert.equal(certified.evidenceId,evidenceCertification.evidenceId);
  assert.equal(certified.integrityId,evidenceCertification.integrityId);
  assert.equal(certified.receiptId,evidenceCertification.receiptId);
  assert.equal(certified.decisionFingerprint,evidenceCertification.decisionFingerprint);
  assert.equal(certified.syntheticOnly,true);
  assert.equal(certified.authorizationGranted,false);
  assert.equal(certified.dispatchApproved,false);
  assert.equal(certified.externalTransportRequested,false);
  assert.equal(certified.dispatchExecuted,false);
  assert.equal(certified.durablePublicationCreated,false);

  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    closure:{...certified,decisionFingerprint:"FP-DRIFT"},
    evidenceCertification
  }),/drift|identity/i);

  assert.throws(() => certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    certificationId:"EVCLOSECERT-CONFLICT",
    closure:{...closure,decisionFingerprint:"FP-DRIFT"},
    evidenceCertification
  }),/drift|identity|conflict/i);
});