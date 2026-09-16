import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-replay.js";

const authorization = { certificationId: "AUTHCERT-DEC", authorizationId: "AUTH-DEC", candidateId: "CAND-DEC", requestCertificationId: "REQCERT-DEC", requestId: "REQ-DEC", publicationCertificationId: "PUBCERT-DEC", publicationId: "PUB-DEC", decisionFingerprint: "FP-DEC", authorizationState: "READY_FOR_AUTHORIZATION_REVIEW", authorizationGranted: false, externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true, replayDisposition: "ADMIT", certified: true } as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification;

test("P13.17521-17640: authorization decision is non-granting and transport-free", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionReplayRegistry();
  const decision = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ decisionId: "DEC-01", authorizationCertification: authorization });
  assert.equal(decision.decisionState, "REVIEW_REQUIRED");
  assert.equal(decision.authorizationGranted, false);
  assert.equal(decision.dispatchApproved, false);
  assert.equal(decision.externalTransportRequested, false);
  assert.equal(decision.dispatchExecuted, false);
  assert.equal(decision.syntheticOnly, true);
  const cert = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ certificationId: "DECCERT-01", decision, authorizationCertification: authorization });
  assert.equal(cert.replayDisposition, "ADMIT");
  const replay = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ certificationId: "DECCERT-01-R", decision, authorizationCertification: authorization });
  assert.equal(replay.replayDisposition, "REPLAY");
});

test("P13.17761-17880: authorization decision certification rejects grant or fingerprint drift", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionReplayRegistry();
  const decision = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ decisionId: "DEC-02", authorizationCertification: authorization });
  assert.throws(() => certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ certificationId: "DECCERT-02", decision: { ...decision, authorizationGranted: true }, authorizationCertification: authorization }), /invalid|grants/i);
  assert.throws(() => certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ certificationId: "DECCERT-02B", decision: { ...decision, decisionFingerprint: "FP-DRIFT" }, authorizationCertification: authorization }), /drift/i);
});
