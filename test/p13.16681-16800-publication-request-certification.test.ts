import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection.js";
import { certifyLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "../src/application/local-runtime-recovery-operational-audit-publication.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublication } from "../src/application/local-runtime-recovery-operational-audit-publication-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "../src/application/local-runtime-recovery-final-closure-audit-evidence-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationRequest } from "../src/application/local-runtime-recovery-operational-audit-publication-request.js";
import { resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-request-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest, assertLocalRuntimeRecoveryOperationalAuditPublicationRequestCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-request-certification.js";

function prepared(fingerprint = "FP-RQC") {
  const evidence = { evidenceId: "AE-RQC", auditCertificationId: "AUDCERT-RQC", auditRecordId: "AUD-RQC", closureCertificationId: "CERT-RQC", closureEvidenceId: "CE-RQC", continuityCertificationId: "CONT-RQC", receiptId: "RCP-RQC", closureId: "CLS-RQC", executionId: "EXEC-RQC", dispatchId: "DISP-RQC", acknowledgementId: "ACK-RQC", decisionFingerprint: fingerprint, complete: true, syntheticOnly: true } as const;
  const evidenceCertification = { certificationId: "AECERT-RQC", evidenceId: "AE-RQC", auditCertificationId: "AUDCERT-RQC", auditRecordId: "AUD-RQC", closureCertificationId: "CERT-RQC", closureEvidenceId: "CE-RQC", decisionFingerprint: fingerprint, replayDisposition: "ADMIT", certified: true, syntheticOnly: true } as LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification;
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-RQC", evidenceCertification, evidence });
  const projectionCertification = certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "PROJCERT-RQC", projection, evidenceCertification });
  const envelope = createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: "PUB-RQC", certification: projectionCertification, projection });
  const certification = certifyLocalRuntimeRecoveryOperationalAuditPublication({ publicationCertificationId: "PUBCERT-RQC", envelope, certification: projectionCertification, projection });
  const request = createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "PUBREQ-RQC", certification, envelope });
  return { request, certification, envelope };
}

test("P13.16681-16800: integrated request certification admits then replays", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry();
  const p = prepared();
  const first = certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest({ certificationId: "REQCERT-RQC", ...p });
  assert.equal(first.certified, true);
  assert.equal(first.replayDisposition, "ADMIT");
  assert.equal(first.syntheticOnly, true);
  assert.equal(first.externalTransportRequested, false);
  const second = certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest({ certificationId: "REQCERT-RQC-REPLAY", ...p });
  assert.equal(second.replayDisposition, "REPLAY");
  assert.equal(second.decisionFingerprint, first.decisionFingerprint);
});

test("P13.16681-16800: integrated request certification fails closed on drift", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry();
  const p = prepared();
  const certified = certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest({ certificationId: "REQCERT-RQC", ...p });
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationRequestCertification({ ...certified, decisionFingerprint: "FP-DRIFT" }, p.request), /drift/i);
  assert.throws(() => certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest({ certificationId: "REQCERT-RQC-CONFLICT", request: { ...p.request, decisionFingerprint: "FP-DRIFT" }, certification: p.certification, envelope: p.envelope }), /drift|conflict/i);
});
