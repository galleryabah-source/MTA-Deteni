import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection.js";
import { certifyLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "../src/application/local-runtime-recovery-operational-audit-publication.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublication } from "../src/application/local-runtime-recovery-operational-audit-publication-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "../src/application/local-runtime-recovery-final-closure-audit-evidence-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationRequest, assertLocalRuntimeRecoveryOperationalAuditPublicationRequest } from "../src/application/local-runtime-recovery-operational-audit-publication-request.js";

function prepared(fingerprint = "FP-REQ") {
  const evidence = { evidenceId: "AE-REQ", auditCertificationId: "AUDCERT-REQ", auditRecordId: "AUD-REQ", closureCertificationId: "CERT-REQ", closureEvidenceId: "CE-REQ", continuityCertificationId: "CONT-REQ", receiptId: "RCP-REQ", closureId: "CLS-REQ", executionId: "EXEC-REQ", dispatchId: "DISP-REQ", acknowledgementId: "ACK-REQ", decisionFingerprint: fingerprint, complete: true, syntheticOnly: true } as const;
  const evidenceCertification = { certificationId: "AECERT-REQ", evidenceId: "AE-REQ", auditCertificationId: "AUDCERT-REQ", auditRecordId: "AUD-REQ", closureCertificationId: "CERT-REQ", closureEvidenceId: "CE-REQ", decisionFingerprint: fingerprint, replayDisposition: "ADMIT", certified: true, syntheticOnly: true } as LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification;
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-REQ", evidenceCertification, evidence });
  const projectionCertification = certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "PROJCERT-REQ", projection, evidenceCertification });
  const envelope = createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: "PUB-REQ", certification: projectionCertification, projection });
  const certification = certifyLocalRuntimeRecoveryOperationalAuditPublication({ publicationCertificationId: "PUBCERT-REQ", envelope, certification: projectionCertification, projection });
  return { envelope, certification };
}

test("P13.16441-16560: publication request admission preserves certified publication identity", () => {
  const p = prepared();
  const request = createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "PUBREQ-1", certification: p.certification, envelope: p.envelope });
  assertLocalRuntimeRecoveryOperationalAuditPublicationRequest(request, p.certification, p.envelope);
  assert.equal(request.requestState, "ADMITTED");
  assert.equal(request.externalTransportRequested, false);
  assert.equal(request.syntheticOnly, true);
});

test("P13.16441-16560: request admission fails closed on drift or transport", () => {
  const p = prepared();
  const request = createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "PUBREQ-2", certification: p.certification, envelope: p.envelope });
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationRequest({ ...request, executionId: "EXEC-DRIFT" } as never, p.certification, p.envelope), /drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationRequest({ ...request, externalTransportRequested: true } as never, p.certification, p.envelope), /transport/i);
  assert.throws(() => createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "", certification: p.certification, envelope: p.envelope }), /identity/i);
});

test("P13.16441-16560: request admission rejects non-admissible publication certification", () => {
  const p = prepared();
  assert.throws(() => createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "PUBREQ-3", certification: { ...p.certification, externalPublicationPerformed: true } as never, envelope: p.envelope }), /unpublished|publication/i);
});
