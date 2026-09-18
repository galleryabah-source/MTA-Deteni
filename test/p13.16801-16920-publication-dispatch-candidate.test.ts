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
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";

function prepared() {
  const evidence = { evidenceId: "AE-DPC", auditCertificationId: "AUDCERT-DPC", auditRecordId: "AUD-DPC", closureCertificationId: "CERT-DPC", closureEvidenceId: "CE-DPC", continuityCertificationId: "CONT-DPC", receiptId: "RCP-DPC", closureId: "CLS-DPC", executionId: "EXEC-DPC", dispatchId: "DISP-DPC", acknowledgementId: "ACK-DPC", decisionFingerprint: "FP-DPC", complete: true, syntheticOnly: true } as const;
  const evidenceCertification = { certificationId: "AECERT-DPC", evidenceId: "AE-DPC", auditCertificationId: "AUDCERT-DPC", auditRecordId: "AUD-DPC", closureCertificationId: "CERT-DPC", closureEvidenceId: "CE-DPC", decisionFingerprint: "FP-DPC", replayDisposition: "ADMIT", certified: true, syntheticOnly: true } as LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification;
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-DPC", evidenceCertification, evidence });
  const projectionCertification = certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "PROJCERT-DPC", projection, evidenceCertification });
  const envelope = createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: "PUB-DPC", certification: projectionCertification, projection });
  const publicationCertification = certifyLocalRuntimeRecoveryOperationalAuditPublication({ publicationCertificationId: "PUBCERT-DPC", envelope, certification: projectionCertification, projection });
  const request = createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "PUBREQ-DPC", certification: publicationCertification, envelope });
  resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry();
  const requestCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest({ certificationId: "REQCERT-DPC", request, certification: publicationCertification, envelope });
  return requestCertification;
}

test("P13.16801-16920: dispatch candidate is review-only and synthetic", () => {
  const requestCertification = prepared();
  const candidate = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ candidateId: "CAND-DPC", requestCertification });
  assert.equal(candidate.candidateState, "READY_FOR_DISPATCH_REVIEW");
  assert.equal(candidate.externalTransportRequested, false);
  assert.equal(candidate.dispatchExecuted, false);
  assert.equal(candidate.syntheticOnly, true);
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate(candidate, requestCertification);
});

test("P13.16801-16920: dispatch candidate rejects identity drift", () => {
  const requestCertification = prepared();
  const candidate = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ candidateId: "CAND-DPC", requestCertification });
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ ...candidate, publicationId: "PUB-DRIFT" }, requestCertification), /drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate(({ ...candidate, dispatchExecuted: true } as unknown as typeof candidate), requestCertification), /invalid|execution/i);
});
