import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryOperationalAuditProjection, assertLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection.js";
import { certifyLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope, assertLocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "../src/application/local-runtime-recovery-operational-audit-publication.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublication, resetLocalRuntimeRecoveryOperationalAuditPublicationReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublication, assertLocalRuntimeRecoveryOperationalAuditPublicationCertification } from "../src/application/local-runtime-recovery-operational-audit-publication-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "../src/application/local-runtime-recovery-final-closure-audit-evidence-certification.js";

function chain(fingerprint = "FP-PUB") {
  const evidence = { evidenceId: "AE-PUB", auditCertificationId: "AUDCERT-PUB", auditRecordId: "AUD-PUB", closureCertificationId: "CERT-PUB", closureEvidenceId: "CE-PUB", continuityCertificationId: "CONT-PUB", receiptId: "RCP-PUB", closureId: "CLS-PUB", executionId: "EXEC-PUB", dispatchId: "DISP-PUB", acknowledgementId: "ACK-PUB", decisionFingerprint: fingerprint, complete: true, syntheticOnly: true } as const;
  const evidenceCertification = { certificationId: "AECERT-PUB", evidenceId: "AE-PUB", auditCertificationId: "AUDCERT-PUB", auditRecordId: "AUD-PUB", closureCertificationId: "CERT-PUB", closureEvidenceId: "CE-PUB", decisionFingerprint: fingerprint, replayDisposition: "ADMIT", certified: true, syntheticOnly: true } as LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification;
  return { evidence, evidenceCertification };
}

function prepared(fingerprint = "FP-PUB", publicationId = "PUB-P") {
  const c = chain(fingerprint);
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-PUB", evidenceCertification: c.evidenceCertification, evidence: c.evidence });
  const projectionCertification = certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "PROJCERT-PUB", projection, evidenceCertification: c.evidenceCertification });
  const envelope = createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId, certification: projectionCertification, projection });
  return { c, projection, projectionCertification, envelope };
}

test("P13.16081-16200: publication envelope preserves complete projection certification identity", () => {
  const p = prepared();
  assertLocalRuntimeRecoveryOperationalAuditPublicationEnvelope(p.envelope, p.projectionCertification, p.projection);
  assert.equal(p.envelope.publicationState, "READY_FOR_PUBLICATION");
  assert.equal(p.envelope.publicationReady, true);
  assert.equal(p.envelope.externallyPublished, false);
  assert.equal(p.envelope.syntheticOnly, true);
});

test("P13.16081-16200: publication readiness fails closed on drift, conflict or non-synthetic state", () => {
  const p = prepared();
  assert.throws(() => createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: "PUB-D", certification: { ...p.projectionCertification, decisionFingerprint: "FP-DRIFT" }, projection: p.projection }), /drift/i);
  assert.throws(() => createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: "PUB-D", certification: p.projectionCertification, projection: ({ ...p.projection, syntheticOnly: false } as unknown as typeof p.projection) }), /synthetic/i);
  assert.throws(() => createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope({ publicationId: "", certification: p.projectionCertification, projection: p.projection }), /identity/i);
});

test("P13.16201-16320: publication replay is ADMIT/REPLAY/CONFLICT without external publication", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationReplayRegistry();
  const p = prepared();
  const args = { envelope: p.envelope, certification: p.projectionCertification, projection: p.projection };
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublication(args), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublication(args), "REPLAY");
  const d = prepared("FP-CONFLICT", "PUB-P");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublication({ envelope: d.envelope, certification: d.projectionCertification, projection: d.projection }), "CONFLICT");
  assert.equal(p.envelope.externallyPublished, false);
});

test("P13.16321-16440: integrated publication certification composes readiness and replay boundaries", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationReplayRegistry();
  const p = prepared();
  const certification = certifyLocalRuntimeRecoveryOperationalAuditPublication({ publicationCertificationId: "PUBCERT-PUB", envelope: p.envelope, certification: p.projectionCertification, projection: p.projection });
  assertLocalRuntimeRecoveryOperationalAuditPublicationCertification(certification, p.envelope);
  assert.equal(certification.certified, true);
  assert.equal(certification.replayDisposition, "ADMIT");
  assert.equal(certification.externalPublicationPerformed, false);
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditPublicationCertification({ ...certification, executionId: "EXEC-DRIFT" }, p.envelope), /drift/i);
  assert.throws(() => certifyLocalRuntimeRecoveryOperationalAuditPublication({ publicationCertificationId: "", envelope: p.envelope, certification: p.projectionCertification, projection: p.projection }), /identity/i);
});
