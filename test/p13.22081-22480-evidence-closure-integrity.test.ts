import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-closure-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-closure-integrity.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-closure-integrity-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-closure-integrity-certification.js";

const closure = { certificationId:"CLOSE-C", closureId:"CLOSE", evidenceCertificationId:"EVID-C", evidenceId:"EVID", integrityCertificationId:"INT-C", integrityId:"INT", receiptId:"RCPT", decisionCertificationId:"DEC-C", decisionId:"DEC", decisionFingerprint:"FP", closureState:"CLOSED_FOR_REVIEW", authorizationGranted:false, dispatchApproved:false, externalTransportRequested:false, dispatchExecuted:false, durablePublicationCreated:false, syntheticOnly:true, replayDisposition:"ADMIT", certified:true } as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureCertification;

test("P13.22081-22240: evidence closure integrity boundary binds the certified closure", () => {
  const integrity = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity({ integrityId:"ECI-1", closureCertification:closure });
  assert.equal(integrity.integrityState, "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT");
  assert.equal(integrity.closureCertificationId, "CLOSE-C");
  assert.equal(integrity.syntheticOnly, true);
  assert.equal(integrity.authorizationGranted, false);
  assert.equal(integrity.dispatchExecuted, false);
});

test("P13.22241-22360: evidence closure integrity replay is deterministic", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityReplayRegistry();
  const integrity = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity({ integrityId:"ECI-2", closureCertification:closure });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity({ integrity, closureCertification:closure }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity({ integrity, closureCertification:closure }), "REPLAY");
  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity({ integrity:{ ...integrity, decisionFingerprint:"DRIFT" }, closureCertification:closure }), /drift/i);
});

test("P13.22361-22480: integrated evidence closure integrity certification remains review-only", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityReplayRegistry();
  const certified = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity({ certificationId:"ECI-C", closureCertification:closure });
  assert.equal(certified.certified, true);
  assert.equal(certified.replayDisposition, "ADMIT");
  assert.equal(certified.integrityState, "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT");
  assert.equal(certified.externalTransportRequested, false);
  assert.equal(certified.durablePublicationCreated, false);
});
