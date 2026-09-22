import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection.js";
import { certifyLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "../src/application/local-runtime-recovery-operational-audit-publication.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublication } from "../src/application/local-runtime-recovery-operational-audit-publication-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "../src/application/local-runtime-recovery-final-closure-audit-evidence-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationRequest } from "../src/application/local-runtime-recovery-operational-audit-publication-request.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest } from "../src/application/local-runtime-recovery-operational-audit-publication-request-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-certification.js";

test("P13.19361-20080 composes receipt closure through closure integrity evidence", () => {
  const fingerprint = "FP-E2E-20080";
  const evidence = {
    evidenceId: "AE-E2E-20080", auditCertificationId: "AUDCERT-E2E-20080", auditRecordId: "AUD-E2E-20080",
    closureCertificationId: "CERT-E2E-20080", closureEvidenceId: "CE-E2E-20080", continuityCertificationId: "CONT-E2E-20080",
    receiptId: "RCP-E2E-20080", closureId: "CLS-E2E-20080", executionId: "EXEC-E2E-20080", dispatchId: "DISP-E2E-20080",
    acknowledgementId: "ACK-E2E-20080", decisionFingerprint: fingerprint, complete: true, syntheticOnly: true,
  } as const;
  const evidenceCertification = {
    certificationId: "AECERT-E2E-20080", evidenceId: evidence.evidenceId, auditCertificationId: evidence.auditCertificationId,
    auditRecordId: evidence.auditRecordId, closureCertificationId: evidence.closureCertificationId, closureEvidenceId: evidence.closureEvidenceId,
    decisionFingerprint: fingerprint, replayDisposition: "ADMIT", certified: true, syntheticOnly: true,
  } as LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification;

  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-E2E-20080", evidenceCertification, evidence });
  const projectionCertification = certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "PROJCERT-E2E-20080", projection, evidenceCertification });
  const envelope = createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: "PUB-E2E-20080", certification: projectionCertification, projection });
  const publicationCertification = certifyLocalRuntimeRecoveryOperationalAuditPublication({ publicationCertificationId: "PUBCERT-E2E-20080", envelope, certification: projectionCertification, projection });
  const request = createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "PUBREQ-E2E-20080", certification: publicationCertification, envelope });
  const requestCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest({ certificationId: "REQCERT-E2E-20080", request, certification: publicationCertification, envelope });
  const candidate = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ candidateId: "CAND-E2E-20080", requestCertification });
  const authorization = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ authorizationId: "AUTH-E2E-20080", candidate });
  const authorizationCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ certificationId: "AUTHCERT-E2E-20080", authorization, candidate });
  const decision = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ decisionId: "DEC-E2E-20080", authorizationCertification });
  const decisionCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ certificationId: "DECCERT-E2E-20080", decision, authorizationCertification });
  const decisionEvidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ evidenceId: "EVID-E2E-20080", decisionCertification });
  const decisionEvidenceCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ certificationId: "EVCERT-E2E-20080", evidence: decisionEvidence, decisionCertification });
  const evidenceClosure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ closureId: "EVIDCLOSE-E2E-20080", evidence: decisionEvidence, decisionCertification });
  const evidenceClosureCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ certificationId: "EVIDCLOSECERT-E2E-20080", closure: evidenceClosure, decisionCertification });
  const closureIntegrity = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity({ integrityId: "INT-E2E-20080", closureCertification: evidenceClosureCertification, decisionCertification });
  const closureIntegrityCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity({ certificationId: "INTCERT-E2E-20080", integrity: closureIntegrity, closureCertification: evidenceClosureCertification, decisionCertification });
  const receipt = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ receiptId: "RCPT-E2E-20080", integrityCertification: closureIntegrityCertification, decisionCertification });
  const receiptCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ certificationId: "RCPTCERT-E2E-20080", receipt, integrityCertification: closureIntegrityCertification, decisionCertification });
  const receiptClosure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ closureId: "RCPTCLOSE-E2E-20080", receiptCertification, integrityCertification: closureIntegrityCertification, decisionCertification });
  const receiptClosureCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ certificationId: "RCPTCLOSECERT-E2E-20080", closure: receiptClosure, receiptCertification, integrityCertification: closureIntegrityCertification, decisionCertification });
  const closureIntegrity2 = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrity({ integrityId: "RCLOSEINT-E2E-20080", closureCertification: receiptClosureCertification, receiptCertification, integrityCertification: closureIntegrityCertification, decisionCertification });
  const closureIntegrity2Certification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrity({ certificationId: "RCLOSEINTCERT-E2E-20080", integrity: closureIntegrity2, closureCertification: receiptClosureCertification, receiptCertification, integrityCertification: closureIntegrityCertification, decisionCertification });
  const terminalEvidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({ evidenceId: "TERMINAL-EVID-E2E-20080", integrityCertification: closureIntegrity2Certification });
  const terminalEvidenceCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({ certificationId: "TERMINAL-EVIDCERT-E2E-20080", evidence: terminalEvidence, integrityCertification: closureIntegrity2Certification });

  assert.equal(request.requestState, "ADMITTED");
  assert.equal(decision.decisionState, "REVIEW_REQUIRED");
  assert.equal(decisionEvidence.evidenceState, "READY_FOR_REVIEW");
  assert.equal(evidenceClosure.closureState, "CLOSED_FOR_REVIEW");
  assert.equal(closureIntegrity.integrityState, "VERIFIED_TERMINAL_REVIEW_ARTIFACT");
  assert.equal(receipt.receiptState, "RECEIVED_FOR_REVIEW");
  assert.equal(receiptClosure.evidenceClosureIntegrityReceiptClosureState, "CLOSED_FOR_REVIEW");
  assert.equal(closureIntegrity2.integrityState, "VERIFIED_TERMINAL_RECEIPT_CLOSURE_REVIEW_ARTIFACT");
  assert.equal(terminalEvidence.evidenceState, "READY_FOR_REVIEW");
  assert.equal(terminalEvidenceCertification.certified, true);

  for (const value of [closureIntegrity2, closureIntegrity2Certification, terminalEvidence, terminalEvidenceCertification]) {
    assert.equal(value.syntheticOnly, true);
    assert.equal(value.authorizationGranted, false);
    assert.equal(value.dispatchApproved, false);
    assert.equal(value.externalTransportRequested, false);
    assert.equal(value.dispatchExecuted, false);
    assert.equal(value.durablePublicationCreated, false);
  }

  assert.equal(closureIntegrity2.decisionFingerprint, fingerprint);
  assert.equal(terminalEvidence.decisionFingerprint, fingerprint);
  assert.equal(terminalEvidence.integrityId, closureIntegrity2.integrityId);

  assert.throws(
    () => createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({
      evidenceId: "TERMINAL-INVALID",
      integrityCertification: { ...closureIntegrity2Certification, certified: false } as typeof closureIntegrity2Certification,
    }),
    /not admissible/i,
  );
});
