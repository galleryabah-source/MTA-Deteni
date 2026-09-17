import type { LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "./local-runtime-recovery-final-closure-audit-evidence-certification.js";

export type LocalRuntimeRecoveryOperationalAuditProjection = Readonly<{
  projectionId: string;
  evidenceCertificationId: string;
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
  projectionState: "READY";
  complete: true;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditProjection(input: { projectionId: string; evidenceCertification: LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification; evidence: { evidenceId: string; auditCertificationId: string; auditRecordId: string; closureCertificationId: string; closureEvidenceId: string; continuityCertificationId: string; receiptId: string; closureId: string; executionId: string; dispatchId: string; acknowledgementId: string; decisionFingerprint: string; complete: true; syntheticOnly: true } }): LocalRuntimeRecoveryOperationalAuditProjection {
  if (!input.projectionId.trim()) throw new Error("Operational audit projection identity is required.");
  const c = input.evidenceCertification;
  const e = input.evidence;
  if (!c.certified || !c.syntheticOnly) throw new Error("Operational audit projection requires certified synthetic evidence.");
  if (!e.complete || !e.syntheticOnly) throw new Error("Operational audit projection requires complete synthetic evidence.");
  if (c.evidenceId !== e.evidenceId || c.auditCertificationId !== e.auditCertificationId || c.auditRecordId !== e.auditRecordId || c.closureCertificationId !== e.closureCertificationId || c.closureEvidenceId !== e.closureEvidenceId || c.decisionFingerprint !== e.decisionFingerprint) throw new Error("Operational audit projection source identity drift.");
  return Object.freeze({ projectionId: input.projectionId, evidenceCertificationId: c.certificationId, evidenceId: e.evidenceId, auditCertificationId: e.auditCertificationId, auditRecordId: e.auditRecordId, closureCertificationId: e.closureCertificationId, closureEvidenceId: e.closureEvidenceId, continuityCertificationId: e.continuityCertificationId, receiptId: e.receiptId, closureId: e.closureId, executionId: e.executionId, dispatchId: e.dispatchId, acknowledgementId: e.acknowledgementId, decisionFingerprint: e.decisionFingerprint, projectionState: "READY", complete: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditProjection(input: LocalRuntimeRecoveryOperationalAuditProjection, evidenceCertification: LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification): void {
  if (!input.projectionId.trim() || !input.complete || !input.syntheticOnly || input.projectionState !== "READY") throw new Error("Operational audit projection must be complete, READY and synthetic-only.");
  if (!evidenceCertification.certified || !evidenceCertification.syntheticOnly) throw new Error("Operational audit projection source certification is not admissible.");
  if (input.evidenceCertificationId !== evidenceCertification.certificationId || input.evidenceId !== evidenceCertification.evidenceId || input.auditCertificationId !== evidenceCertification.auditCertificationId || input.auditRecordId !== evidenceCertification.auditRecordId || input.closureCertificationId !== evidenceCertification.closureCertificationId || input.closureEvidenceId !== evidenceCertification.closureEvidenceId || input.decisionFingerprint !== evidenceCertification.decisionFingerprint) throw new Error("Operational audit projection identity drift.");
}
