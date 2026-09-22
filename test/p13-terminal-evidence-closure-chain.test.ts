import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-certification.js";

test("P13.20081-20320 composes terminal evidence through evidence closure without publication side effect", () => {
  const evidence = {
    certificationId:"EVCERT-20080", evidenceId:"TERMINAL-EVID-E2E-20080", integrityCertificationId:"RCLOSEINTCERT-E2E-20080",
    integrityId:"RCLOSEINT-E2E-20080", closureCertificationId:"RCPTCLOSECERT-E2E-20080", closureId:"RCPTCLOSE-E2E-20080",
    receiptId:"RCPT-E2E-20080", decisionCertificationId:"DECCERT-E2E-20080", decisionId:"DEC-E2E-20080",
    decisionFingerprint:"FP-E2E-20080", evidenceState:"READY_FOR_REVIEW", authorizationGranted:false,
    dispatchApproved:false, externalTransportRequested:false, dispatchExecuted:false, durablePublicationCreated:false,
    syntheticOnly:true, replayDisposition:"ADMIT", certified:true
  } as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceCertification;

  const terminalEvidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({
    evidenceId:evidence.evidenceId,
    integrityCertification: {
      certificationId:evidence.integrityCertificationId, integrityId:evidence.integrityId,
      closureCertificationId:evidence.closureCertificationId, closureId:evidence.closureId,
      receiptId:evidence.receiptId, decisionCertificationId:evidence.decisionCertificationId,
      decisionId:evidence.decisionId, decisionFingerprint:evidence.decisionFingerprint,
      integrityState:"VERIFIED_TERMINAL_RECEIPT_CLOSURE_REVIEW_ARTIFACT",
      certified:true, replayDisposition:"ADMIT", syntheticOnly:true,
      authorizationGranted:false, dispatchApproved:false, externalTransportRequested:false,
      dispatchExecuted:false, durablePublicationCreated:false
    } as unknown as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityCertification
  });
  const terminalCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({
    certificationId:"TERMINAL-CERT-20080", evidence:terminalEvidence,
    integrityCertification: {
      certificationId:evidence.integrityCertificationId, integrityId:evidence.integrityId,
      closureCertificationId:evidence.closureCertificationId, closureId:evidence.closureId,
      receiptId:evidence.receiptId, decisionCertificationId:evidence.decisionCertificationId,
      decisionId:evidence.decisionId, decisionFingerprint:evidence.decisionFingerprint,
      integrityState:"VERIFIED_TERMINAL_RECEIPT_CLOSURE_REVIEW_ARTIFACT",
      certified:true, replayDisposition:"ADMIT", syntheticOnly:true,
      authorizationGranted:false, dispatchApproved:false, externalTransportRequested:false,
      dispatchExecuted:false, durablePublicationCreated:false
    } as unknown as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityCertification
  });

  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    closureId:"TERMINAL-CLOSURE-20080", evidenceCertification:terminalCertification
  });
  const certifiedClosure = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    certificationId:"TERMINAL-CLOSURE-CERT-20080", closure, evidenceCertification:terminalCertification
  });

  assert.equal(terminalEvidence.evidenceState,"READY_FOR_REVIEW");
  assert.equal(terminalCertification.certified,true);
  assert.equal(closure.closureState,"CLOSED_FOR_REVIEW");
  assert.equal(certifiedClosure.certified,true);
  assert.equal(certifiedClosure.replayDisposition,"ADMIT");
  assert.equal(certifiedClosure.decisionFingerprint,evidence.decisionFingerprint);
  assert.equal(certifiedClosure.integrityId,evidence.integrityId);
  assert.equal(certifiedClosure.receiptId,evidence.receiptId);
  assert.equal(certifiedClosure.authorizationGranted,false);
  assert.equal(certifiedClosure.dispatchApproved,false);
  assert.equal(certifiedClosure.externalTransportRequested,false);
  assert.equal(certifiedClosure.dispatchExecuted,false);
  assert.equal(certifiedClosure.durablePublicationCreated,false);
  assert.equal(certifiedClosure.syntheticOnly,true);

  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    closure:certifiedClosure,evidenceCertification:terminalCertification
  }),"REPLAY");

  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    closure:{...certifiedClosure,decisionFingerprint:"DRIFT"}, evidenceCertification:terminalCertification
  }),/drift|identity/i);
});