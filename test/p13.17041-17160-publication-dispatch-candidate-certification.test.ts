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
import { resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-candidate-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-candidate-certification.js";

function prepared() {
  const evidence = { evidenceId: "AE-DCC", auditCertificationId: "AUDCERT-DCC", auditRecordId: "AUD-DCC", closureCertificationId: "CERT-DCC", closureEvidenceId: "CE-DCC", continuityCertificationId: "CONT-DCC", receiptId: "RCP-DCC", closureId: "CLS-DCC", executionId: "EXEC-DCC", dispatchId: "DISP-DCC", acknowledgementId: "ACK-DCC", decisionFingerprint: "FP-DCC", complete: true, syntheticOnly: true } as const;
  const evidenceCertification = { certificationId: "AECERT-DCC", evidenceId: "AE-DCC", auditCertificationId: "AUDCERT-DCC", auditRecordId: "AUD-DCC", closureCertificationId: "CERT-DCC", closureEvidenceId: "CE-DCC", decisionFingerprint: "FP-DCC", replayDisposition: "ADMIT", certified: true, syntheticOnly: true } as LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification;
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-DCC", evidenceCertification, evidence });
  const projectionCertification = certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "PROJCERT-DCC", projection, evidenceCertification });
  const envelope = createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: "PUB-DCC", certification: projectionCertification, projection });
  const publicationCertification = certifyLocalRuntimeRecoveryOperationalAuditPublication({ publicationCertificationId: "PUBCERT-DCC", envelope, certification: projectionCertification, projection });
  const request = createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "PUBREQ-DCC", certification: publicationCertification, envelope });
  resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry();
  const requestCertification = certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest({ certificationId: "REQCERT-DCC", request, certification: publicationCertification, envelope });
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateReplayRegistry();
  const candidate = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ candidateId: "CAND-DCC", requestCertification });
  return { candidate, requestCertification };
}

test("P13.17041-17160: dispatch candidate certification is deterministic and transport-free", () => {
  const p = prepared();
  const certification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ certificationId: "CANDCERT-DCC", ...p });
  assert.equal(certification.certified, true);
  assert.equal(certification.replayDisposition, "ADMIT");
  assert.equal(certification.syntheticOnly, true);
  assert.equal(certification.externalTransportRequested, false);
  assert.equal(certification.dispatchExecuted, false);
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateCertification(certification, p.candidate);
  const replay = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ certificationId: "CANDCERT-DCC-REPLAY", ...p });
  assert.equal(replay.replayDisposition, "REPLAY");
});

test("P13.17041-17160: certification rejects identity drift and execution", () => {
  const p = prepared();
  const certification = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ certificationId: "CANDCERT-DCC", ...p });
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateCertification({ ...certification, publicationId: "PUB-DRIFT" }, p.candidate), /drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateCertification({ ...certification, dispatchExecuted: true }, p.candidate), /invalid/i);
});
