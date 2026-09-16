import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryFinalClosureAuditEvidence, assertLocalRuntimeRecoveryFinalClosureAuditEvidence } from "../src/application/local-runtime-recovery-final-closure-audit-evidence.js";
import { replayLocalRuntimeRecoveryFinalClosureAuditEvidence, clearLocalRuntimeRecoveryFinalClosureAuditEvidenceReplayRegistry } from "../src/application/local-runtime-recovery-final-closure-audit-evidence-replay.js";
import { certifyLocalRuntimeRecoveryFinalClosureAuditEvidence, assertLocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "../src/application/local-runtime-recovery-final-closure-audit-evidence-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditCertification } from "../src/application/local-runtime-recovery-final-closure-audit-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditRecord } from "../src/application/local-runtime-recovery-final-closure-audit-record.js";
import type { LocalRuntimeRecoveryClosureCertification } from "../src/application/local-runtime-recovery-closure-certification.js";
import type { LocalRuntimeRecoveryClosureEvidence } from "../src/application/local-runtime-recovery-closure-evidence.js";

function chain(fingerprint = "FP-E") {
  const evidence = { evidenceId: "EVD-E", continuityCertificationId: "CONT-E", receiptId: "RCP-E", closureId: "CLS-E", executionId: "EXEC-E", dispatchId: "DISP-E", acknowledgementId: "ACK-E", decisionFingerprint: fingerprint, closureDisposition: "CLOSED", complete: true, syntheticOnly: true } as LocalRuntimeRecoveryClosureEvidence;
  const certification = { certificationId: "CERT-E", evidenceId: "EVD-E", continuityCertificationId: "CONT-E", receiptId: "RCP-E", closureId: "CLS-E", executionId: "EXEC-E", dispatchId: "DISP-E", acknowledgementId: "ACK-E", decisionFingerprint: fingerprint, certified: true, syntheticOnly: true } as LocalRuntimeRecoveryClosureCertification;
  const record = { auditRecordId: "AUD-E", certificationId: "CERT-E", evidenceId: "EVD-E", continuityCertificationId: "CONT-E", receiptId: "RCP-E", closureId: "CLS-E", executionId: "EXEC-E", dispatchId: "DISP-E", acknowledgementId: "ACK-E", decisionFingerprint: fingerprint, auditState: "CLOSED", complete: true, syntheticOnly: true } as LocalRuntimeRecoveryFinalClosureAuditRecord;
  const auditCertification = { certificationId: "AUDCERT-E", auditRecordId: "AUD-E", closureCertificationId: "CERT-E", evidenceId: "EVD-E", continuityCertificationId: "CONT-E", receiptId: "RCP-E", closureId: "CLS-E", executionId: "EXEC-E", dispatchId: "DISP-E", acknowledgementId: "ACK-E", decisionFingerprint: fingerprint, replayDisposition: "ADMIT", certified: true, syntheticOnly: true } as LocalRuntimeRecoveryFinalClosureAuditCertification;
  return { evidence, certification, record, auditCertification };
}

test("P13.15361-15480: final audit evidence preserves exact audit chain", () => {
  const c = chain();
  const evidence = createLocalRuntimeRecoveryFinalClosureAuditEvidence({ evidenceId: "AE-E", auditCertification: c.auditCertification, auditRecord: c.record, closureCertification: c.certification, closureEvidence: c.evidence });
  assertLocalRuntimeRecoveryFinalClosureAuditEvidence({ evidence, auditCertification: c.auditCertification, auditRecord: c.record, closureCertification: c.certification, closureEvidence: c.evidence });
  assert.equal(evidence.complete, true);
  assert.equal(evidence.auditState, "CLOSED");
});

test("P13.15481-15600: final audit evidence replay is deterministic", () => {
  clearLocalRuntimeRecoveryFinalClosureAuditEvidenceReplayRegistry();
  const c = chain();
  const evidence = createLocalRuntimeRecoveryFinalClosureAuditEvidence({ evidenceId: "AE-R", auditCertification: c.auditCertification, auditRecord: c.record, closureCertification: c.certification, closureEvidence: c.evidence });
  const args = { evidence, auditCertification: c.auditCertification, auditRecord: c.record, closureCertification: c.certification, closureEvidence: c.evidence };
  assert.equal(replayLocalRuntimeRecoveryFinalClosureAuditEvidence(args), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryFinalClosureAuditEvidence(args), "REPLAY");
  const d = chain("FP-DRIFT");
  const driftEvidence = createLocalRuntimeRecoveryFinalClosureAuditEvidence({ evidenceId: "AE-R", auditCertification: d.auditCertification, auditRecord: d.record, closureCertification: d.certification, closureEvidence: d.evidence });
  assert.equal(replayLocalRuntimeRecoveryFinalClosureAuditEvidence({ ...args, evidence: driftEvidence, auditCertification: d.auditCertification, auditRecord: d.record, closureCertification: d.certification, closureEvidence: d.evidence }), "CONFLICT");
});

test("P13.15601-15720: final audit evidence certification is identity-bound", () => {
  clearLocalRuntimeRecoveryFinalClosureAuditEvidenceReplayRegistry();
  const c = chain();
  const evidence = createLocalRuntimeRecoveryFinalClosureAuditEvidence({ evidenceId: "AE-C", auditCertification: c.auditCertification, auditRecord: c.record, closureCertification: c.certification, closureEvidence: c.evidence });
  const certification = certifyLocalRuntimeRecoveryFinalClosureAuditEvidence({ certificationId: "AECERT-E", evidence, auditCertification: c.auditCertification, auditRecord: c.record, closureCertification: c.certification, closureEvidence: c.evidence });
  assertLocalRuntimeRecoveryFinalClosureAuditEvidenceCertification(certification, evidence);
  assert.throws(() => assertLocalRuntimeRecoveryFinalClosureAuditEvidenceCertification({ ...certification, decisionFingerprint: "FP-DRIFT" }, evidence), /drift/i);
  assert.throws(() => certifyLocalRuntimeRecoveryFinalClosureAuditEvidence({ certificationId: "", evidence, auditCertification: c.auditCertification, auditRecord: c.record, closureCertification: c.certification, closureEvidence: c.evidence }), /identity/i);
});
