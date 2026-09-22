import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection.js";
import { certifyLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "../src/application/local-runtime-recovery-operational-audit-publication.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublication } from "../src/application/local-runtime-recovery-operational-audit-publication-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "../src/application/local-runtime-recovery-final-closure-audit-evidence-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationRequest } from "../src/application/local-runtime-recovery-operational-audit-publication-request.js";
import { resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-request-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest } from "../src/application/local-runtime-recovery-operational-audit-publication-request-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization.js";
import { resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision.js";
import { resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence.js";
import { resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-certification.js";

test("P13 publication chain preserves identity and remains non-executable through decision evidence", () => {
  const fingerprint = "FP-CHAIN";
  const evidence = {
    evidenceId: "AE-CHAIN", auditCertificationId: "AUDCERT-CHAIN", auditRecordId: "AUD-CHAIN",
    closureCertificationId: "CERT-CHAIN", closureEvidenceId: "CE-CHAIN", continuityCertificationId: "CONT-CHAIN",
    receiptId: "RCP-CHAIN", closureId: "CLS-CHAIN", executionId: "EXEC-CHAIN", dispatchId: "DISP-CHAIN",
    acknowledgementId: "ACK-CHAIN", decisionFingerprint: fingerprint, complete: true, syntheticOnly: true,
  } as const;
  const evidenceCertification = {
    certificationId: "AECERT-CHAIN", evidenceId: "AE-CHAIN", auditCertificationId: "AUDCERT-CHAIN",
    auditRecordId: "AUD-CHAIN", closureCertificationId: "CERT-CHAIN", closureEvidenceId: "CE-CHAIN",
    decisionFingerprint: fingerprint, replayDisposition: "ADMIT", certified: true, syntheticOnly: true,
  } as LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification;

  resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry();
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationReplayRegistry();
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionReplayRegistry();
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceReplayRegistry();

  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-CHAIN", evidenceCertification, evidence });
  const projectionCertification = certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "PROJCERT-CHAIN", projection, evidenceCertification });
  const envelope = createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: "PUB-CHAIN", certification: projectionCertification, projection });
  const publicationCertification = certifyLocalRuntimeRecoveryOperationalAuditPublication({ publicationCertificationId: "PUBCERT-CHAIN", envelope, certification: projectionCertification, projection });
  const request = createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "PUBREQ-CHAIN", certification: publicationCertification, envelope });
  const requestCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest({ certificationId: "REQCERT-CHAIN", request, certification: publicationCertification, envelope });
  const candidate = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ candidateId: "CAND-CHAIN", requestCertification });
  const authorization = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ authorizationId: "AUTH-CHAIN", candidate });
  const authorizationCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ certificationId: "AUTHCERT-CHAIN", authorization, candidate });
  const decision = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ decisionId: "DEC-CHAIN", authorizationCertification });
  const decisionCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ certificationId: "DECCERT-CHAIN", decision, authorizationCertification });
  const decisionEvidence = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ evidenceId: "EVID-CHAIN", decisionCertification });
  const decisionEvidenceCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ certificationId: "EVCERT-CHAIN", evidence: decisionEvidence, decisionCertification });

  assert.equal(request.requestState, "ADMITTED");
  assert.equal(requestCertification.replayDisposition, "ADMIT");
  assert.equal(candidate.candidateState, "READY_FOR_DISPATCH_REVIEW");
  assert.equal(authorization.authorizationGranted, false);
  assert.equal(authorizationCertification.replayDisposition, "ADMIT");
  assert.equal(decision.decisionState, "REVIEW_REQUIRED");
  assert.equal(decisionCertification.replayDisposition, "ADMIT");
  assert.equal(decisionEvidence.evidenceState, "READY_FOR_REVIEW");
  assert.equal(decisionEvidenceCertification.replayDisposition, "ADMIT");

  for (const value of [request, requestCertification, candidate, authorization, authorizationCertification, decision, decisionCertification, decisionEvidence, decisionEvidenceCertification]) {
    assert.equal(value.syntheticOnly, true);
    assert.equal(value.externalTransportRequested, false);
  }
  assert.equal(decisionEvidence.dispatchExecuted, false);
  assert.equal(decisionEvidence.authorizationGranted, false);
  assert.equal(decisionEvidence.dispatchApproved, false);

  assert.throws(
    () => certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({
      certificationId: "EVCERT-DRIFT",
      evidence: { ...decisionEvidence, decisionFingerprint: "FP-DRIFT" },
      decisionCertification,
    }),
    /drift/i,
  );
});
