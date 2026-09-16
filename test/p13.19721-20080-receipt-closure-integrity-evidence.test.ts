import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-certification.js";

const integrity = { certificationId:"INT-C", integrityId:"INT", closureCertificationId:"CLOSE-C", closureId:"CLOSE", receiptCertificationId:"RCPT-C", receiptId:"RCPT", integrityCertificationId:"INT-C", integrityArtifactId:"INT", decisionCertificationId:"DEC-C", decisionId:"DEC", decisionFingerprint:"FP", integrityState:"VERIFIED_TERMINAL_RECEIPT_CLOSURE_REVIEW_ARTIFACT", authorizationGranted:false, dispatchApproved:false, externalTransportRequested:false, dispatchExecuted:false, durablePublicationCreated:false, syntheticOnly:true, replayDisposition:"ADMIT", certified:true } as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityCertification;

test("P13.19721-19840: evidence envelope preserves terminal identity and review-only invariants", () => {
  const evidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({ evidenceId:"EVID-1", integrityCertification:integrity });
  assert.equal(evidence.evidenceState, "READY_FOR_REVIEW");
  assert.equal(evidence.syntheticOnly, true);
  assert.equal(evidence.authorizationGranted, false);
  assert.equal(evidence.dispatchApproved, false);
  assert.equal(evidence.dispatchExecuted, false);
  assert.equal(evidence.externalTransportRequested, false);
  assert.equal(evidence.durablePublicationCreated, false);
});

test("P13.19841-19960: evidence replay is ADMIT then REPLAY and rejects drift", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceReplayRegistry();
  const evidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({ evidenceId:"EVID-2", integrityCertification:integrity });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({ evidence, integrityCertification:integrity }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({ evidence, integrityCertification:integrity }), "REPLAY");
  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({ evidence:{ ...evidence, decisionFingerprint:"DRIFT" }, integrityCertification:integrity }), /drift/i);
});

test("P13.19961-20080: integrated evidence certification fails closed and remains non-executable", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceReplayRegistry();
  const evidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({ evidenceId:"EVID-3", integrityCertification:integrity });
  const certified = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence({ certificationId:"EVID-C", evidence, integrityCertification:integrity });
  assert.equal(certified.certified, true);
  assert.equal(certified.syntheticOnly, true);
  assert.equal(certified.authorizationGranted, false);
  assert.equal(certified.dispatchApproved, false);
  assert.equal(certified.dispatchExecuted, false);
});
