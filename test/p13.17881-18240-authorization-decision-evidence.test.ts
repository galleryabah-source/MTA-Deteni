import assert from "node:assert/strict";
import test from "node:test";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-certification.js";
import { resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-replay.js";

const decisionCertification = { certificationId: "DECCERT-EV", decisionId: "DEC-EV", authorizationCertificationId: "AUTHCERT-EV", authorizationId: "AUTH-EV", candidateId: "CAND-EV", requestId: "REQ-EV", publicationCertificationId: "PUBCERT-EV", publicationId: "PUB-EV", decisionFingerprint: "FP-EV", decisionState: "REVIEW_REQUIRED", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true, replayDisposition: "ADMIT", certified: true } as const as LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification;

test("P13.17881-18000: evidence preserves non-granting decision invariants", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceReplayRegistry();
  const evidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ evidenceId: "EVID-01", decisionCertification });
  assert.equal(evidence.evidenceState, "READY_FOR_REVIEW");
  assert.equal(evidence.authorizationGranted, false);
  assert.equal(evidence.dispatchApproved, false);
  assert.equal(evidence.externalTransportRequested, false);
  assert.equal(evidence.dispatchExecuted, false);
  assert.equal(evidence.syntheticOnly, true);
  const first = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ certificationId: "EVCERT-01", evidence, decisionCertification });
  assert.equal(first.replayDisposition, "ADMIT");
  const replay = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ certificationId: "EVCERT-01-R", evidence, decisionCertification });
  assert.equal(replay.replayDisposition, "REPLAY");
});

test("P13.18121-18240: evidence rejects identity drift and attempted execution", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceReplayRegistry();
  const evidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ evidenceId: "EVID-02", decisionCertification });
  assert.throws(() => certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ certificationId: "EVCERT-02", evidence: { ...evidence, publicationId: "DRIFT" }, decisionCertification }), /identity drift/i);
  assert.throws(() => certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ certificationId: "EVCERT-02B", evidence: { ...evidence, dispatchExecuted: true } as never, decisionCertification }), /invalid|executable/i);
});
