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
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-candidate-replay.js";

function prepared(fingerprint: string, suffix = "BASE") {
  const evidence = { evidenceId: "AE-DCR", auditCertificationId: "AUDCERT-DCR", auditRecordId: "AUD-DCR", closureCertificationId: "CERT-DCR", closureEvidenceId: "CE-DCR", continuityCertificationId: "CONT-DCR", receiptId: "RCP-DCR", closureId: "CLS-DCR", executionId: "EXEC-DCR", dispatchId: "DISP-DCR", acknowledgementId: "ACK-DCR", decisionFingerprint: fingerprint, complete: true, syntheticOnly: true } as const;
  const evidenceCertification = { certificationId: "AECERT-DCR", evidenceId: "AE-DCR", auditCertificationId: "AUDCERT-DCR", auditRecordId: "AUD-DCR", closureCertificationId: "CERT-DCR", closureEvidenceId: "CE-DCR", decisionFingerprint: fingerprint, replayDisposition: "ADMIT", certified: true, syntheticOnly: true } as LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification;
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-DCR", evidenceCertification, evidence });
  const projectionCertification = certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "PROJCERT-DCR", projection, evidenceCertification });
  const envelope = createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: "PUB-DCR", certification: projectionCertification, projection });
  const publicationCertification = certifyLocalRuntimeRecoveryOperationalAuditPublication({ publicationCertificationId: "PUBCERT-DCR", envelope, certification: projectionCertification, projection });
  const request = createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "PUBREQ-DCR", certification: publicationCertification, envelope });
  resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry();
  const requestCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest({ certificationId: "REQCERT-DCR", request, certification: publicationCertification, envelope });
  return { candidate: createLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ candidateId: "CAND-DCR", requestCertification }), requestCertification };
}

test("P13.16921-17040: dispatch candidate replay is ADMIT/REPLAY/CONFLICT", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateReplayRegistry();
  const first = prepared("FP-DCR");
  const second = prepared("FP-CONFLICT");
  const args = { candidate: first.candidate, requestCertification: first.requestCertification };
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate(args), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate(args), "REPLAY");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ candidate: second.candidate, requestCertification: second.requestCertification }), "CONFLICT");
});
