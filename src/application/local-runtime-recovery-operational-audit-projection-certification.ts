import type { LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "./local-runtime-recovery-final-closure-audit-evidence-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditProjection } from "./local-runtime-recovery-operational-audit-projection.js";
import { assertLocalRuntimeRecoveryOperationalAuditProjection } from "./local-runtime-recovery-operational-audit-projection.js";
import { replayLocalRuntimeRecoveryOperationalAuditProjection, type OperationalAuditProjectionReplayDisposition } from "./local-runtime-recovery-operational-audit-projection-replay.js";

export type LocalRuntimeRecoveryOperationalAuditProjectionCertification = Readonly<{
  certificationId: string;
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
  replayDisposition: "ADMIT" | "REPLAY";
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeRecoveryOperationalAuditProjection(input: { certificationId: string; projection: LocalRuntimeRecoveryOperationalAuditProjection; evidenceCertification: LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification }): LocalRuntimeRecoveryOperationalAuditProjectionCertification {
  if (!input.certificationId.trim()) throw new Error("Operational audit projection certification identity is required.");
  assertLocalRuntimeRecoveryOperationalAuditProjection(input.projection, input.evidenceCertification);
  const replayDisposition = replayLocalRuntimeRecoveryOperationalAuditProjection(input);
  if (replayDisposition === "CONFLICT") throw new Error("Operational audit projection certification conflict.");
  const p = input.projection;
  return Object.freeze({ certificationId: input.certificationId, projectionId: p.projectionId, evidenceCertificationId: p.evidenceCertificationId, evidenceId: p.evidenceId, auditCertificationId: p.auditCertificationId, auditRecordId: p.auditRecordId, closureCertificationId: p.closureCertificationId, closureEvidenceId: p.closureEvidenceId, continuityCertificationId: p.continuityCertificationId, receiptId: p.receiptId, closureId: p.closureId, executionId: p.executionId, dispatchId: p.dispatchId, acknowledgementId: p.acknowledgementId, decisionFingerprint: p.decisionFingerprint, replayDisposition, certified: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditProjectionCertification(input: LocalRuntimeRecoveryOperationalAuditProjectionCertification, projection: LocalRuntimeRecoveryOperationalAuditProjection): void {
  if (!input.certificationId.trim() || !input.certified || !input.syntheticOnly) throw new Error("Operational audit projection certification must be certified and synthetic-only.");
  if (input.projectionId !== projection.projectionId || input.evidenceCertificationId !== projection.evidenceCertificationId || input.evidenceId !== projection.evidenceId || input.auditCertificationId !== projection.auditCertificationId || input.auditRecordId !== projection.auditRecordId || input.closureCertificationId !== projection.closureCertificationId || input.closureEvidenceId !== projection.closureEvidenceId || input.continuityCertificationId !== projection.continuityCertificationId || input.receiptId !== projection.receiptId || input.closureId !== projection.closureId || input.executionId !== projection.executionId || input.dispatchId !== projection.dispatchId || input.acknowledgementId !== projection.acknowledgementId || input.decisionFingerprint !== projection.decisionFingerprint) throw new Error("Operational audit projection certification drift.");
}

export type { OperationalAuditProjectionReplayDisposition };
