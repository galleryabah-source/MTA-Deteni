import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-certification.js";

const evidence = { certificationId:"EVID-C", evidenceId:"EVID", integrityCertificationId:"INT-C", integrityId:"INT", closureCertificationId:"CLOSE-C", closureId:"CLOSE", receiptId:"RCPT", decisionCertificationId:"DEC-C", decisionId:"DEC", decisionFingerprint:"FP", evidenceState:"READY_FOR_REVIEW", authorizationGranted:false, dispatchApproved:false, externalTransportRequested:false, dispatchExecuted:false, durablePublicationCreated:false, syntheticOnly:true, replayDisposition:"ADMIT", certified:true } as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceCertification;

test("P13.20081-20160: evidence closure preserves complete identity chain", () => {
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({ closureId:"EC-1", evidenceCertification:evidence });
  assert.equal(closure.closureState, "CLOSED_FOR_REVIEW");
  assert.equal(closure.evidenceId, evidence.evidenceId);
  assert.equal(closure.integrityId, evidence.integrityId);
  assert.equal(closure.receiptId, evidence.receiptId);
  assert.equal(closure.decisionFingerprint, evidence.decisionFingerprint);
  assert.equal(closure.durablePublicationCreated, false);
});

test("P13.20161-20240: closure replay is deterministic and drift-safe", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({ closureId:"EC-2", evidenceCertification:evidence });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({ closure, evidenceCertification:evidence }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({ closure, evidenceCertification:evidence }), "REPLAY");
  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({ closure:{ ...closure, decisionFingerprint:"DRIFT" }, evidenceCertification:evidence }), /drift/i);
});

test("P13.20241-20320: integrated closure certification remains review-only", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry();
  const certified = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({ certificationId:"EC-C", closureId:"EC-CLOSURE", evidenceCertification:evidence });
  assert.equal(certified.certified, true);
  assert.equal(certified.replayDisposition, "ADMIT");
  assert.equal(certified.authorizationGranted, false);
  assert.equal(certified.dispatchApproved, false);
  assert.equal(certified.dispatchExecuted, false);
  assert.equal(certified.externalTransportRequested, false);
  assert.equal(certified.durablePublicationCreated, false);
});
