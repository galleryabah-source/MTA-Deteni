import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-certification.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-replay.js";

const decisionCertification = {
  certificationId: "DECCERT-R",
  decisionId: "DEC-R",
  authorizationCertificationId: "AUTHCERT-R",
  authorizationId: "AUTH-R",
  candidateId: "CAND-R",
  requestId: "REQ-R",
  publicationCertificationId: "PUBCERT-R",
  publicationId: "PUB-R",
  decisionFingerprint: "FP-R",
  decisionState: "REVIEW_REQUIRED",
  authorizationGranted: false,
  dispatchApproved: false,
  externalTransportRequested: false,
  dispatchExecuted: false,
  syntheticOnly: true,
  replayDisposition: "ADMIT",
  certified: true,
} as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification;

const integrityCertification = {
  certificationId: "INTCERT-R",
  integrityId: "INT-R",
  closureCertificationId: "CLOSECERT-R",
  closureId: "CLOSE-R",
  decisionCertificationId: "DECCERT-R",
  decisionId: "DEC-R",
  authorizationCertificationId: "AUTHCERT-R",
  authorizationId: "AUTH-R",
  candidateId: "CAND-R",
  requestId: "REQ-R",
  publicationCertificationId: "PUBCERT-R",
  publicationId: "PUB-R",
  decisionFingerprint: "FP-R",
  integrityState: "VERIFIED_TERMINAL_REVIEW_ARTIFACT",
  authorizationGranted: false,
  dispatchApproved: false,
  externalTransportRequested: false,
  dispatchExecuted: false,
  durablePublicationCreated: false,
  syntheticOnly: true,
  replayDisposition: "ADMIT",
  certified: true,
} as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityCertification;

test("P13.18801-18920: terminal integrity receipt preserves review-only chain", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptReplayRegistry();
  const receipt = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ receiptId: "RCPT-R", integrityCertification, decisionCertification });
  assert.equal(receipt.receiptState, "RECEIVED_FOR_REVIEW");
  assert.equal(receipt.authorizationGranted, false);
  assert.equal(receipt.dispatchApproved, false);
  assert.equal(receipt.externalTransportRequested, false);
  assert.equal(receipt.dispatchExecuted, false);
  assert.equal(receipt.durablePublicationCreated, false);
  assert.equal(receipt.syntheticOnly, true);
});

test("P13.18921-18960: receipt replay is deterministic and drift/execution fail closed", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptReplayRegistry();
  const receipt = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ receiptId: "RCPT-R2", integrityCertification, decisionCertification });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ receipt, integrityCertification, decisionCertification }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ receipt, integrityCertification, decisionCertification }), "REPLAY");
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ ...receipt, decisionFingerprint: "FP-DRIFT" }, integrityCertification, decisionCertification), /drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ ...receipt, dispatchExecuted: true } as never, integrityCertification, decisionCertification), /invalid|executable/i);
  const cert = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt({ certificationId: "RCPTCERT-R", receipt, integrityCertification, decisionCertification });
  assert.equal(cert.certified, true);
});
