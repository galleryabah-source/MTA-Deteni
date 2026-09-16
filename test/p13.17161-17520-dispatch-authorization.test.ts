import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-certification.js";

function candidate(): LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate {
  return Object.freeze({ candidateId: "CAND-AUTH", requestCertificationId: "REQCERT-AUTH", requestId: "REQ-AUTH", publicationCertificationId: "PUBCERT-AUTH", publicationId: "PUB-AUTH", decisionFingerprint: "FP-AUTH", candidateState: "READY_FOR_DISPATCH_REVIEW", externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true });
}

test("P13.17161-17280: authorization is review-only and cannot execute", () => {
  const c = candidate();
  const a = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ authorizationId: "AUTH-AUTH", candidate: c });
  assert.equal(a.authorizationState, "READY_FOR_AUTHORIZATION_REVIEW");
  assert.equal(a.authorizationGranted, false);
  assert.equal(a.externalTransportRequested, false);
  assert.equal(a.dispatchExecuted, false);
  assert.equal(a.syntheticOnly, true);
});

test("P13.17281-17400: authorization replay is deterministic", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationReplayRegistry();
  const c = candidate();
  const a = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ authorizationId: "AUTH-REPLAY", candidate: c });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ authorization: a, candidate: c }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ authorization: a, candidate: c }), "REPLAY");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ authorization: { ...a, decisionFingerprint: "FP-CONFLICT" }, candidate: c }), "CONFLICT");
});

test("P13.17401-17520: integrated authorization certification preserves safety invariants", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationReplayRegistry();
  const c = candidate();
  const a = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ authorizationId: "AUTH-CERT", candidate: c });
  const cert = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ certificationId: "AUTHCERT-1", authorization: a, candidate: c });
  assert.equal(cert.certified, true);
  assert.equal(cert.replayDisposition, "ADMIT");
  assert.equal(cert.authorizationGranted, false);
  assert.equal(cert.externalTransportRequested, false);
  assert.equal(cert.dispatchExecuted, false);
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification(cert, a);
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification({ ...cert, publicationId: "PUB-DRIFT" }, a), /drift|invalid/i);
});
