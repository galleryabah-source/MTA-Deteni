import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryOperationalAuditProjection, assertLocalRuntimeRecoveryOperationalAuditProjection } from "../src/application/local-runtime-recovery-operational-audit-projection.js";
import { replayLocalRuntimeRecoveryOperationalAuditProjection, resetLocalRuntimeRecoveryOperationalAuditProjectionReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-projection-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditProjection, assertLocalRuntimeRecoveryOperationalAuditProjectionCertification } from "../src/application/local-runtime-recovery-operational-audit-projection-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "../src/application/local-runtime-recovery-final-closure-audit-evidence-certification.js";

function chain(fingerprint = "FP-P") {
  const evidence = {
    evidenceId: "AE-P", auditCertificationId: "AUDCERT-P", auditRecordId: "AUD-P", closureCertificationId: "CERT-P", closureEvidenceId: "CE-P",
    continuityCertificationId: "CONT-P", receiptId: "RCP-P", closureId: "CLS-P", executionId: "EXEC-P", dispatchId: "DISP-P", acknowledgementId: "ACK-P",
    decisionFingerprint: fingerprint, complete: true, syntheticOnly: true,
  } as const;
  const evidenceCertification = {
    certificationId: "AECERT-P", evidenceId: "AE-P", auditCertificationId: "AUDCERT-P", auditRecordId: "AUD-P", closureCertificationId: "CERT-P", closureEvidenceId: "CE-P",
    decisionFingerprint: fingerprint, replayDisposition: "ADMIT", certified: true, syntheticOnly: true,
  } as LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification;
  return { evidence, evidenceCertification };
}

test("P13.15721-15840: operational audit projection preserves complete evidence identity", () => {
  const c = chain();
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-P", evidenceCertification: c.evidenceCertification, evidence: c.evidence });
  assertLocalRuntimeRecoveryOperationalAuditProjection(projection, c.evidenceCertification);
  assert.equal(projection.projectionState, "READY");
  assert.equal(projection.complete, true);
  assert.equal(projection.syntheticOnly, true);
  assert.equal(projection.executionId, "EXEC-P");
});

test("P13.15721-15840: projection fails closed on identity or fingerprint drift", () => {
  const c = chain();
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-D", evidenceCertification: c.evidenceCertification, evidence: c.evidence });
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditProjection({ ...projection, executionId: "EXEC-DRIFT" } as never, c.evidenceCertification), /drift/i);
  assert.throws(() => createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-D", evidenceCertification: c.evidenceCertification, evidence: { ...c.evidence, decisionFingerprint: "FP-DRIFT" } }), /drift/i);
  assert.throws(() => createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-D", evidenceCertification: { ...c.evidenceCertification, syntheticOnly: false } as never, evidence: c.evidence }), /synthetic/i);
});

test("P13.15841-15960: operational audit projection replay is ADMIT/REPLAY/CONFLICT", () => {
  resetLocalRuntimeRecoveryOperationalAuditProjectionReplayRegistry();
  const c = chain();
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-R", evidenceCertification: c.evidenceCertification, evidence: c.evidence });
  const args = { projection, evidenceCertification: c.evidenceCertification };
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditProjection(args), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditProjection(args), "REPLAY");
  const d = chain("FP-DRIFT");
  const drift = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-R", evidenceCertification: d.evidenceCertification, evidence: d.evidence });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditProjection({ projection: drift, evidenceCertification: d.evidenceCertification }), "CONFLICT");
});

test("P13.15961-16080: operational audit projection certification composes replay boundary", () => {
  resetLocalRuntimeRecoveryOperationalAuditProjectionReplayRegistry();
  const c = chain();
  const projection = createLocalRuntimeRecoveryOperationalAuditProjection({ projectionId: "PROJ-C", evidenceCertification: c.evidenceCertification, evidence: c.evidence });
  const certification = certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "PROJCERT-P", projection, evidenceCertification: c.evidenceCertification });
  assertLocalRuntimeRecoveryOperationalAuditProjectionCertification(certification, projection);
  assert.equal(certification.certified, true);
  assert.equal(certification.replayDisposition, "ADMIT");
  assert.throws(() => assertLocalRuntimeRecoveryOperationalAuditProjectionCertification({ ...certification, decisionFingerprint: "FP-DRIFT" } as never, projection), /drift/i);
  assert.throws(() => certifyLocalRuntimeRecoveryOperationalAuditProjection({ certificationId: "", projection, evidenceCertification: c.evidenceCertification }), /identity/i);
});
