import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrityReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-integrity-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-integrity-certification.js";

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

function makeClosureCertification(id: string) {
  return {
    certificationId: id,
    closureId: id.replace("CERT", "CLOSE"),
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
}

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
  const args = { closure, evidenceCertification: evidenceCertification as Parameters<typeof replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure>[0]["evidenceCertification"] };
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure(args), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure(args), "REPLAY");
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure({ ...closure, decisionFingerprint: "DRIFT" }, args.evidenceCertification), /identity drift/i);
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
  const closureCertification = makeClosureCertification("CLOSE-C4-CERT");
  const integrity = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity({
    integrityId: "INT-VERIFIED-1",
    closureCertification: closureCertification as Parameters<typeof createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity>[0]["closureCertification"],
  });
  assert.equal(integrity.integrityState, "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT");
  assert.equal(integrity.integrityIdSource, "INT");
  assert.equal(integrity.closureCertificationId, "CLOSE-C4-CERT");
  assert.equal(integrity.authorizationGranted, false);
});

test("P13.24241-24360: integrity replay is deterministic", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityReplayRegistry();
  const closureCertification = makeClosureCertification("CLOSE-C5-CERT");
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
  const closureCertification = makeClosureCertification("CLOSE-C6-CERT");
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

test("P13.24481-24640: evidence-integrity boundary preserves the review artifact chain", () => {
  const integrityCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity({
    certificationId: "INT-CERT-EVID",
    integrityId: "INT-VERIFIED-EVID",
    closureCertification: makeClosureCertification("CLOSE-C7-CERT") as Parameters<typeof certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity>[0]["closureCertification"],
  });
  const evidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence({
    evidenceId: "EVID-VERIFIED",
    integrityCertification: integrityCertification as Parameters<typeof createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence>[0]["integrityCertification"],
  });
  assert.equal(evidence.evidenceState, "READY_FOR_REVIEW");
  assert.equal(evidence.evidenceIdSource, "EVID");
  assert.equal(evidence.syntheticOnly, true);
  assert.equal(evidence.dispatchExecuted, false);
});

test("P13.24641-24760: evidence-integrity replay rejects identity drift", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrityReplayRegistry();
  const integrityCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity({
    certificationId: "INT-CERT-EVID-2",
    integrityId: "INT-VERIFIED-EVID-2",
    closureCertification: makeClosureCertification("CLOSE-C8-CERT") as Parameters<typeof certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity>[0]["closureCertification"],
  });
  const evidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence({
    evidenceId: "EVID-VERIFIED-2",
    integrityCertification: integrityCertification as Parameters<typeof createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence>[0]["integrityCertification"],
  });
  const integrity = {
    integrityId: "INT-EVID-INTEGRITY",
    evidenceId: evidence.evidenceId,
    integrityCertificationId: evidence.integrityCertificationId,
    closureCertificationId: evidence.closureCertificationId,
    closureId: evidence.closureId,
    evidenceCertificationId: evidence.evidenceCertificationId,
    evidenceIdSource: evidence.evidenceIdSource,
    receiptId: evidence.receiptId,
    decisionCertificationId: evidence.decisionCertificationId,
    decisionId: evidence.decisionId,
    decisionFingerprint: evidence.decisionFingerprint,
    integrityState: "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_INTEGRITY_EVIDENCE_REVIEW_ARTIFACT",
    authorizationGranted: false,
    dispatchApproved: false,
    externalTransportRequested: false,
    dispatchExecuted: false,
    durablePublicationCreated: false,
    syntheticOnly: true,
  } as const;
  const args = { integrity: integrity as Parameters<typeof replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity>[0]["integrity"], evidence };
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity(args), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity(args), "REPLAY");
  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity({ ...args, integrity: { ...args.integrity, decisionFingerprint: "DRIFT" } }), /identity drift/i);
});

test("P13.24761-24880: evidence-integrity certification remains non-executable", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrityReplayRegistry();
  const integrityCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity({
    certificationId: "INT-CERT-EVID-3",
    integrityId: "INT-VERIFIED-EVID-3",
    closureCertification: makeClosureCertification("CLOSE-C9-CERT") as Parameters<typeof certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrity>[0]["closureCertification"],
  });
  const evidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence({
    evidenceId: "EVID-VERIFIED-3",
    integrityCertification: integrityCertification as Parameters<typeof createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence>[0]["integrityCertification"],
  });
  const integrity = {
    integrityId: "INT-EVID-CERT",
    evidenceId: evidence.evidenceId,
    integrityCertificationId: evidence.integrityCertificationId,
    closureCertificationId: evidence.closureCertificationId,
    closureId: evidence.closureId,
    evidenceCertificationId: evidence.evidenceCertificationId,
    evidenceIdSource: evidence.evidenceIdSource,
    receiptId: evidence.receiptId,
    decisionCertificationId: evidence.decisionCertificationId,
    decisionId: evidence.decisionId,
    decisionFingerprint: evidence.decisionFingerprint,
    integrityState: "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_INTEGRITY_EVIDENCE_REVIEW_ARTIFACT",
    authorizationGranted: false,
    dispatchApproved: false,
    externalTransportRequested: false,
    dispatchExecuted: false,
    durablePublicationCreated: false,
    syntheticOnly: true,
  } as const;
  const certification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity({
    certificationId: "EVID-INTEGRITY-CERT",
    integrityId: integrity.integrityId,
    integrity: integrity as Parameters<typeof certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity>[0]["integrity"],
    evidence,
  });
  assert.equal(certification.certified, true);
  assert.equal(certification.replayDisposition, "ADMIT");
  assert.equal(certification.integrityState, "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_INTEGRITY_EVIDENCE_REVIEW_ARTIFACT");
  assert.equal(certification.authorizationGranted, false);
  assert.equal(certification.durablePublicationCreated, false);
});
