import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-integrity.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrityReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-integrity-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-integrity-certification.js";

const evidence = { evidenceId:"EVID-1", integrityCertificationId:"INT-C", integrityId:"INT", closureCertificationId:"CLOS-C", closureId:"CLOS", evidenceCertificationId:"E-CERT", evidenceIdSource:"EVID-1", receiptId:"RCPT", decisionCertificationId:"DEC-C", decisionId:"DEC", decisionFingerprint:"FP", evidenceState:"READY_FOR_REVIEW", authorizationGranted:false, dispatchApproved:false, externalTransportRequested:false, dispatchExecuted:false, durablePublicationCreated:false, syntheticOnly:true } as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence;

test("P13.21321-21480: evidence integrity boundary preserves review-only identity chain", () => {
  const integrity = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity({ integrityId:"INT-EVID-1", evidence });
  assert.equal(integrity.integrityState, "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_INTEGRITY_EVIDENCE_REVIEW_ARTIFACT");
  assert.equal(integrity.syntheticOnly, true);
  assert.equal(integrity.authorizationGranted, false);
  assert.equal(integrity.dispatchExecuted, false);
});

test("P13.21481-21600: evidence integrity replay is deterministic", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrityReplayRegistry();
  const integrity = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity({ integrityId:"INT-EVID-2", evidence });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity({ integrity, evidence }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity({ integrity, evidence }), "REPLAY");
  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity({ integrity:{ ...integrity, decisionFingerprint:"DRIFT" }, evidence }), /drift/i);
});

test("P13.21601-21720: integrated evidence integrity certification remains non-executable", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrityReplayRegistry();
  const certified = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity({ certificationId:"INT-EVID-C", integrityId:"INT-EVID-INTEGRITY", evidence });
  assert.equal(certified.certified, true);
  assert.equal(certified.replayDisposition, "ADMIT");
  assert.equal(certified.externalTransportRequested, false);
  assert.equal(certified.durablePublicationCreated, false);
});
