import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-closure.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosure, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-closure-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-closure-certification.js";

const evidence = { certificationId:"ECIE-C", evidenceId:"ECIE", integrityCertificationId:"ECI-C", integrityId:"ECI", closureCertificationId:"EC", closureId:"C", receiptId:"R", decisionCertificationId:"DEC-C", decisionId:"DEC", decisionFingerprint:"FP", evidenceState:"READY_FOR_REVIEW", authorizationGranted:false, dispatchApproved:false, externalTransportRequested:false, dispatchExecuted:false, durablePublicationCreated:false, syntheticOnly:true, replayDisposition:"ADMIT", certified:true } as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceCertification;

test("P13.21081-21200: evidence closure preserves certified evidence identity", () => {
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosure({ closureId:"ECIEC-1", evidenceCertification:evidence });
  assert.equal(closure.closureState, "CLOSED_FOR_REVIEW");
  assert.equal(closure.evidenceCertificationId, "ECIE-C");
  assert.equal(closure.integrityCertificationId, "ECI-C");
  assert.equal(closure.syntheticOnly, true);
  assert.equal(closure.dispatchExecuted, false);
});

test("P13.21201-21280: evidence closure replay is deterministic", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureReplayRegistry();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosure({ closureId:"ECIEC-2", evidenceCertification:evidence });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosure({ closure, evidenceCertification:evidence }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosure({ closure, evidenceCertification:evidence }), "REPLAY");
  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosure({ closure:{ ...closure, decisionFingerprint:"DRIFT" }, evidenceCertification:evidence }), /drift/i);
});

test("P13.21281-21320: integrated closure certification remains non-executable", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureReplayRegistry();
  const certified = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosure({ certificationId:"ECIEC-C", closureId:"ECIEC-CLOSURE", evidenceCertification:evidence });
  assert.equal(certified.certified, true);
  assert.equal(certified.replayDisposition, "ADMIT");
  assert.equal(certified.authorizationGranted, false);
  assert.equal(certified.externalTransportRequested, false);
  assert.equal(certified.durablePublicationCreated, false);
});
