import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-certification.js";

const integrity = { certificationId:"ECI-C", integrityId:"ECI", evidenceCertificationId:"EVID-C", evidenceId:"EVID", closureCertificationId:"EC", closureId:"C", receiptId:"R", decisionCertificationId:"DEC-C", decisionId:"DEC", decisionFingerprint:"FP", integrityState:"VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT", authorizationGranted:false, dispatchApproved:false, externalTransportRequested:false, dispatchExecuted:false, durablePublicationCreated:false, syntheticOnly:true, replayDisposition:"ADMIT", certified:true } as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityCertification;

test("P13.20681-20840: evidence boundary preserves terminal integrity identity", () => {
  const evidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence({ evidenceId:"ECIE-1", integrityCertification:integrity });
  assert.equal(evidence.evidenceState, "READY_FOR_REVIEW");
  assert.equal(evidence.integrityCertificationId, "ECI-C");
  assert.equal(evidence.evidenceCertificationId, "EVID-C");
  assert.equal(evidence.syntheticOnly, true);
  assert.equal(evidence.externalTransportRequested, false);
  assert.equal(evidence.durablePublicationCreated, false);
});

test("P13.20841-20960: evidence replay is deterministic and detects drift", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceReplayRegistry();
  const evidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence({ evidenceId:"ECIE-2", integrityCertification:integrity });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence({ evidence, integrityCertification:integrity }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence({ evidence, integrityCertification:integrity }), "REPLAY");
  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence({ evidence:{ ...evidence, decisionFingerprint:"DRIFT" }, integrityCertification:integrity }), /drift/i);
});

test("P13.20961-21080: integrated evidence certification remains review-only", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceReplayRegistry();
  const certified = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence({ certificationId:"ECIE-C", integrityCertification:integrity });
  assert.equal(certified.certified, true);
  assert.equal(certified.replayDisposition, "ADMIT");
  assert.equal(certified.authorizationGranted, false);
  assert.equal(certified.dispatchApproved, false);
  assert.equal(certified.dispatchExecuted, false);
});
