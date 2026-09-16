import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-certification.js";

const evidenceCertification = {
  certificationId: "EVID-C",
  evidenceId: "EVID",
  integrityCertificationId: "INT-C",
  integrityId: "INT",
  receiptId: "RCPT",
  decisionCertificationId: "DEC-C",
  decisionId: "DEC",
  decisionFingerprint: "FP",
  evidenceState: "READY_FOR_REVIEW",
  authorizationGranted: false,
  dispatchApproved: false,
  externalTransportRequested: false,
  dispatchExecuted: false,
  durablePublicationCreated: false,
  syntheticOnly: true,
  replayDisposition: "ADMIT",
  certified: true,
} as const;

test("P13.23681-23840: terminal evidence closure preserves the certified identity chain", () => {
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    closureId: "CLOSE-1",
    evidenceCertification: evidenceCertification as Parameters<typeof createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure>[0]["evidenceCertification"],
  });
  assert.equal(closure.closureState, "CLOSED_FOR_REVIEW");
  assert.equal(closure.evidenceCertificationId, "EVID-C");
  assert.equal(closure.decisionFingerprint, "FP");
  assert.equal(closure.authorizationGranted, false);
  assert.equal(closure.durablePublicationCreated, false);
});

test("P13.23841-23960: terminal evidence closure replay is deterministic and fail-closed on drift", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    closureId: "CLOSE-2",
    evidenceCertification: evidenceCertification as Parameters<typeof createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure>[0]["evidenceCertification"],
  });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({ closure, evidenceCertification: evidenceCertification as Parameters<typeof replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure>[0]["evidenceCertification"] }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({ closure, evidenceCertification: evidenceCertification as Parameters<typeof replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure>[0]["evidenceCertification"] }), "REPLAY");
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({ ...closure, decisionFingerprint: "DRIFT" }, evidenceCertification as Parameters<typeof assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure>[1]), /identity drift/i);
});

test("P13.23961-24080: integrated closure certification remains review-only", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry();
  const certification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({
    certificationId: "CLOSE-C",
    closureId: "CLOSE-3",
    evidenceCertification: evidenceCertification as Parameters<typeof certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure>[0]["evidenceCertification"],
  });
  assert.equal(certification.certified, true);
  assert.equal(certification.replayDisposition, "ADMIT");
  assert.equal(certification.syntheticOnly, true);
  assert.equal(certification.dispatchExecuted, false);
  assert.equal(certification.externalTransportRequested, false);
});

test("P13.24081-24240: terminal evidence closure integrity binds to the exact closure certification", () => {
  const closureCertification = {
    certificationId: "CLOSE-C4",
    closureId: "CLOSE-4",
    evidenceCertificationId: "EVID-C",
    evidenceId: "EVID",
    integrityCertificationId: "INT-C",
    integrityId: "INT",
    receiptId: "RCPT",
    decisionCertificationId: "DEC-C",
    decisionId: "DEC",
    decisionFingerprint: "FP",
    closureState: "CLOSED_FOR_REVIEW",
    authorizationGranted: false,
    dispatchApproved: false,
    externalTransportRequested: false,
    dispatchExecuted: false,
    durablePublicationCreated: false,
    syntheticOnly: true,
    replayDisposition: "ADMIT",
    certified: true,
  } as const;
  const integrity = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity({
    integrityId: "INT-VERIFIED-1",
    closureCertification: closureCertification as Parameters<typeof createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity>[0]["closureCertification"],
  });
  assert.equal(integrity.integrityState, "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT");
  assert.equal(integrity.integrityIdSource, "INT");
  assert.equal(integrity.closureCertificationId, "CLOSE-C4");
  assert.equal(integrity.authorizationGranted, false);
});

test("P13.24241-24360: integrity replay is deterministic", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityReplayRegistry();
  const closureCertification = {
    certificationId: "CLOSE-C5",
    closureId: "CLOSE-5",
    evidenceCertificationId: "EVID-C",
    evidenceId: "EVID",
    integrityCertificationId: "INT-C",
    integrityId: "INT",
    receiptId: "RCPT",
    decisionCertificationId: "DEC-C",
    decisionId: "DEC",
    decisionFingerprint: "FP",
    closureState: "CLOSED_FOR_REVIEW",
    authorizationGranted: false,
    dispatchApproved: false,
    externalTransportRequested: false,
    dispatchExecuted: false,
    durablePublicationCreated: false,
    syntheticOnly: true,
    replayDisposition: "ADMIT",
    certified: true,
  } as const;
  const integrity = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity({
    integrityId: "INT-VERIFIED-2",
    closureCertification: closureCertification as Parameters<typeof createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity>[0]["closureCertification"],
  });
  const args = { integrity, closureCertification: closureCertification as Parameters<typeof replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity>[0]["closureCertification"] };
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity(args), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity(args), "REPLAY");
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity({ ...integrity, decisionFingerprint: "DRIFT" }, args.closureCertification), /identity drift/i);
});

test("P13.24361-24480: integrated integrity certification remains non-executable", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityReplayRegistry();
  const closureCertification = {
    certificationId: "CLOSE-C6",
    closureId: "CLOSE-6",
    evidenceCertificationId: "EVID-C",
    evidenceId: "EVID",
    integrityCertificationId: "INT-C",
    integrityId: "INT",
    receiptId: "RCPT",
    decisionCertificationId: "DEC-C",
    decisionId: "DEC",
    decisionFingerprint: "FP",
    closureState: "CLOSED_FOR_REVIEW",
    authorizationGranted: false,
    dispatchApproved: false,
    externalTransportRequested: false,
    dispatchExecuted: false,
    durablePublicationCreated: false,
    syntheticOnly: true,
    replayDisposition: "ADMIT",
    certified: true,
  } as const;
  const certification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity({
    certificationId: "INT-CERT-1",
    integrityId: "INT-VERIFIED-3",
    closureCertification: closureCertification as Parameters<typeof certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity>[0]["closureCertification"],
  });
  assert.equal(certification.certified, true);
  assert.equal(certification.replayDisposition, "ADMIT");
  assert.equal(certification.integrityState, "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT");
  assert.equal(certification.authorizationGranted, false);
  assert.equal(certification.dispatchApproved, false);
});
