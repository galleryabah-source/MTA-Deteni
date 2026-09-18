import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-certification.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-replay.js";

const decisionCertification = {
  certificationId: "DECCERT-I", decisionId: "DEC-I", authorizationCertificationId: "AUTHCERT-I", authorizationId: "AUTH-I",
  candidateId: "CAND-I", requestId: "REQ-I", publicationCertificationId: "PUBCERT-I", publicationId: "PUB-I",
  decisionFingerprint: "FP-I", decisionState: "REVIEW_REQUIRED", authorizationGranted: false, dispatchApproved: false,
  externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true, replayDisposition: "ADMIT", certified: true,
} as unknown as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification;

const closureCertification = {
  certificationId: "CLOSECERT-I", closureId: "CLOSE-I", decisionCertificationId: "DECCERT-I", decisionId: "DEC-I",
  authorizationCertificationId: "AUTHCERT-I", authorizationId: "AUTH-I", candidateId: "CAND-I", requestId: "REQ-I",
  publicationCertificationId: "PUBCERT-I", publicationId: "PUB-I", decisionFingerprint: "FP-I", evidenceId: "EVID-I",
  evidenceState: "READY_FOR_REVIEW", closureState: "CLOSED_FOR_REVIEW", authorizationGranted: false, dispatchApproved: false,
  externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true,
  replayDisposition: "ADMIT", certified: true,
} as unknown as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureCertification;

test("P13.18641-18720: closed evidence becomes a terminal review artifact", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReplayRegistry();
  const integrity = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity({ integrityId: "INT-I", closureCertification, decisionCertification });
  assert.equal(integrity.integrityState, "VERIFIED_TERMINAL_REVIEW_ARTIFACT");
  assert.equal(integrity.authorizationGranted, false);
  assert.equal(integrity.dispatchApproved, false);
  assert.equal(integrity.externalTransportRequested, false);
  assert.equal(integrity.dispatchExecuted, false);
  assert.equal(integrity.durablePublicationCreated, false);
  assert.equal(integrity.syntheticOnly, true);
});

test("P13.18721-18800: integrity certification is replay-safe and rejects drift/execution", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReplayRegistry();
  const integrity = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity({ integrityId: "INT-I2", closureCertification, decisionCertification });
  const first = replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity({ integrity, closureCertification });
  const second = replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity({ integrity, closureCertification });
  assert.equal(first, "ADMIT");
  assert.equal(second, "REPLAY");
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity({ ...integrity, decisionFingerprint: "FP-DRIFT" }, decisionCertification), /drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity({ ...integrity, dispatchExecuted: true } as never, decisionCertification), /invalid|executable/i);
  const cert = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity({ certificationId: "INTCERT-I", integrity, closureCertification, decisionCertification });
  assert.equal(cert.certified, true);
  assert.equal(cert.replayDisposition, "REPLAY");
});
