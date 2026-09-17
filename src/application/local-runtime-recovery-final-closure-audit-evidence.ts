import type { LocalRuntimeRecoveryFinalClosureAuditRecord } from "./local-runtime-recovery-final-closure-audit-record.js";
import { assertLocalRuntimeRecoveryFinalClosureAuditRecord } from "./local-runtime-recovery-final-closure-audit-record.js";
import type { LocalRuntimeRecoveryFinalClosureAuditCertification } from "./local-runtime-recovery-final-closure-audit-certification.js";
import type { LocalRuntimeRecoveryClosureCertification } from "./local-runtime-recovery-closure-certification.js";
import type { LocalRuntimeRecoveryClosureEvidence } from "./local-runtime-recovery-closure-evidence.js";

export type LocalRuntimeRecoveryFinalClosureAuditEvidence = Readonly<{
  evidenceId: string;
  auditCertificationId: string;
  auditRecordId: string;
  closureCertificationId: string;
  closureEvidenceId: string;
  continuityCertificationId: string;
  receiptId: string;
  closureId: string;
  executionId: string;
  dispatchId: string;
  acknowledgementId: string;
  decisionFingerprint: string;
  auditState: "CLOSED";
  complete: true;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryFinalClosureAuditEvidence(input: { evidenceId: string; auditCertification: LocalRuntimeRecoveryFinalClosureAuditCertification; auditRecord: LocalRuntimeRecoveryFinalClosureAuditRecord; closureCertification: LocalRuntimeRecoveryClosureCertification; closureEvidence: LocalRuntimeRecoveryClosureEvidence }): LocalRuntimeRecoveryFinalClosureAuditEvidence {
  if (!input.evidenceId.trim()) throw new Error("Final closure audit evidence identity is required.");
  assertLocalRuntimeRecoveryFinalClosureAuditRecord({ record: input.auditRecord, certification: input.closureCertification, evidence: input.closureEvidence });
  if (input.auditCertification.auditRecordId !== input.auditRecord.auditRecordId || input.auditCertification.closureCertificationId !== input.closureCertification.certificationId || input.auditCertification.evidenceId !== input.closureEvidence.evidenceId || input.auditCertification.decisionFingerprint !== input.auditRecord.decisionFingerprint) throw new Error("Final closure audit evidence certification drift.");
  if (!input.auditCertification.certified || !input.auditCertification.syntheticOnly) throw new Error("Final closure audit evidence requires certified synthetic state.");
  return Object.freeze({ evidenceId: input.evidenceId, auditCertificationId: input.auditCertification.certificationId, auditRecordId: input.auditRecord.auditRecordId, closureCertificationId: input.closureCertification.certificationId, closureEvidenceId: input.closureEvidence.evidenceId, continuityCertificationId: input.auditRecord.continuityCertificationId, receiptId: input.auditRecord.receiptId, closureId: input.auditRecord.closureId, executionId: input.auditRecord.executionId, dispatchId: input.auditRecord.dispatchId, acknowledgementId: input.auditRecord.acknowledgementId, decisionFingerprint: input.auditRecord.decisionFingerprint, auditState: "CLOSED", complete: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryFinalClosureAuditEvidence(input: { evidence: LocalRuntimeRecoveryFinalClosureAuditEvidence; auditCertification: LocalRuntimeRecoveryFinalClosureAuditCertification; auditRecord: LocalRuntimeRecoveryFinalClosureAuditRecord; closureCertification: LocalRuntimeRecoveryClosureCertification; closureEvidence: LocalRuntimeRecoveryClosureEvidence }): void {
  if (!input.evidence.complete || !input.evidence.syntheticOnly || input.evidence.auditState !== "CLOSED") throw new Error("Final closure audit evidence must be complete, closed and synthetic-only.");
  assertLocalRuntimeRecoveryFinalClosureAuditRecord({ record: input.auditRecord, certification: input.closureCertification, evidence: input.closureEvidence });
  if (input.evidence.auditCertificationId !== input.auditCertification.certificationId || input.evidence.auditRecordId !== input.auditRecord.auditRecordId || input.evidence.closureCertificationId !== input.closureCertification.certificationId || input.evidence.closureEvidenceId !== input.closureEvidence.evidenceId || input.evidence.continuityCertificationId !== input.auditRecord.continuityCertificationId || input.evidence.receiptId !== input.auditRecord.receiptId || input.evidence.closureId !== input.auditRecord.closureId || input.evidence.executionId !== input.auditRecord.executionId || input.evidence.dispatchId !== input.auditRecord.dispatchId || input.evidence.acknowledgementId !== input.auditRecord.acknowledgementId || input.evidence.decisionFingerprint !== input.auditRecord.decisionFingerprint) throw new Error("Final closure audit evidence identity drift.");
}
