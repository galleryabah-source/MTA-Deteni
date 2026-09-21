import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection.js";
import { certifyLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "../src/application/local-runtime-recovery-operational-audit-publication.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublication } from "../src/application/local-runtime-recovery-operational-audit-publication-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "../src/application/local-runtime-recovery-final-closure-audit-evidence-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationRequest } from "../src/application/local-runtime-recovery-operational-audit-publication-request.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationRequest, resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-request-replay.js";

function prepared(fingerprint = "FP-RQRP", suffix = "BASE") {
  const evidence = { evidenceId: "AE-RQRP", auditCertificationId: "AUDCERT-RQRP", auditRecordId: "AUD-RQRP", closureCertificationId: "CERT-RQRP", closureEvidenceId: "CE-RQRP", continuityCertificationId: "CONT-RQRP", receiptId: "RCP-RQRP", closureId: "CLS-RQRP", executionId: "EXEC-RQRP", dispatchId: "DISP-RQRP", acknowledgementId: "ACK-RQRP", decisionFingerprint: fingerprint, complete: true, syntheticOnly: true } as const;
  const evidenceCertification = { certificationId: "AECERT-RQRP", evidenceId: "AE-RQRP", auditCertificationId: "AUDCERT-RQRP", auditRecordId: "AUD-RQRP", closureCertificationId: "CERT-RQRP", closureEvidenceId: "CE-RQRP", decisionFingerprint: fingerprint, replayDisposition: "ADMIT", certified: true, syntheticOnly: true } as LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification;
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: `PROJ-RQRP-${suffix}`, evidenceCertification, evidence });
  const projectionCertification = certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "PROJCERT-RQRP", projection, evidenceCertification });
  const envelope = createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: `PUB-RQRP-${suffix}`, certification: projectionCertification, projection });
  const certification = certifyLocalRuntimeRecoveryOperationalAuditPublication({ publicationCertificationId: "PUBCERT-RQRP", envelope, certification: projectionCertification, projection });
  const request = createLocalRuntimeRecoveryOperationalAuditPublicationRequest({ requestId: "PUBREQ-RQRP", certification, envelope });
  return { request, certification, envelope };
}

test("P13.16561-16680: publication request replay is ADMIT/REPLAY/CONFLICT", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry();
  const p = prepared();
  const args = { request: p.request, certification: p.certification, envelope: p.envelope };
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationRequest(args), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationRequest(args), "REPLAY");
  const d = prepared("FP-CONFLICT", "CONFLICT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationRequest({ ...args, request: { ...p.request, decisionFingerprint: d.request.decisionFingerprint } }), "CONFLICT");
  assert.equal(p.request.externalTransportRequested, false);
});

test("P13.16561-16680: replay guard fails closed on request identity drift", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry();
  const p = prepared();
  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationRequest({ request: { ...p.request, executionId: "EXEC-DRIFT" }, certification: p.certification, envelope: p.envelope }), /drift/i);
});
