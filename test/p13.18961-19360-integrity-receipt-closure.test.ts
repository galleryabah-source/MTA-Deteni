import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-certification.js";

const decisionCertification = {
  certificationId: "DECCERT-C", decisionId: "DEC-C", authorizationCertificationId: "AUTHCERT-C", authorizationId: "AUTH-C",
  candidateId: "CAND-C", requestId: "REQ-C", publicationCertificationId: "PUBCERT-C", publicationId: "PUB-C",
  decisionFingerprint: "FP-C", decisionState: "REVIEW_REQUIRED", authorizationGranted: false, dispatchApproved: false,
  externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true, replayDisposition: "ADMIT", certified: true,
} as unknown as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification;

const integrityCertification = {
  certificationId: "INTCERT-C", integrityId: "INT-C", closureCertificationId: "CLOSECERT-C", closureId: "CLOSE-C",
  decisionCertificationId: "DECCERT-C", decisionId: "DEC-C", authorizationCertificationId: "AUTHCERT-C", authorizationId: "AUTH-C",
  candidateId: "CAND-C", requestId: "REQ-C", publicationCertificationId: "PUBCERT-C", publicationId: "PUB-C",
  decisionFingerprint: "FP-C", integrityState: "VERIFIED_TERMINAL_REVIEW_ARTIFACT", authorizationGranted: false,
  dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false,
  syntheticOnly: true, replayDisposition: "ADMIT", certified: true,
} as unknown as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityCertification;

function receiptCertification() {
  const receipt = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ receiptId: "RCPT-C", integrityCertification, decisionCertification });
  return certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ certificationId: "RCPTCERT-C", receipt, integrityCertification, decisionCertification });
}

test("P13.18961-19120: terminal integrity receipt closes deterministically for review", () => {
  const receipt = receiptCertification();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ closureId: "RCPTCLOSE-C", receiptCertification: receipt, integrityCertification, decisionCertification });
  assert.equal(closure.evidenceClosureIntegrityReceiptClosureState, "CLOSED_FOR_REVIEW");
  assert.equal(closure.authorizationGranted, false);
  assert.equal(closure.dispatchApproved, false);
  assert.equal(closure.externalTransportRequested, false);
  assert.equal(closure.dispatchExecuted, false);
  assert.equal(closure.durablePublicationCreated, false);
  assert.equal(closure.syntheticOnly, true);
});

test("P13.19121-19240: receipt closure replay is ADMIT/REPLAY and fingerprint drift is CONFLICT", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureReplayRegistry();
  const receipt = receiptCertification();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ closureId: "RCPTCLOSE-R", receiptCertification: receipt, integrityCertification, decisionCertification });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ closure, receiptCertification: receipt, integrityCertification, decisionCertification }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ closure, receiptCertification: receipt, integrityCertification, decisionCertification }), "REPLAY");
  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ closure: { ...closure, decisionFingerprint: "FP-DRIFT" }, receiptCertification: receipt, integrityCertification, decisionCertification }), /drift|identity/i);
});

test("P13.19241-19360: integrated receipt closure certification fails closed on execution or drift", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureReplayRegistry();
  const receipt = receiptCertification();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ closureId: "RCPTCLOSE-S", receiptCertification: receipt, integrityCertification, decisionCertification });
  const cert = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ certificationId: "RCPTCLOSECERT-C", closure, receiptCertification: receipt, integrityCertification, decisionCertification });
  assert.equal(cert.certified, true);
  assert.equal(cert.replayDisposition, "ADMIT");
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ ...closure, dispatchExecuted: true } as never, receipt, integrityCertification, decisionCertification), /invalid|executable/i);
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure({ ...closure, decisionId: "DEC-DRIFT" }, receipt, integrityCertification, decisionCertification), /drift|identity/i);
});
