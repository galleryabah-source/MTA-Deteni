import type { LocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "./local-runtime-recovery-operational-audit-publication.js";
import type { LocalRuntimeRecoveryOperationalAuditProjection } from "./local-runtime-recovery-operational-audit-projection.js";
import type { LocalRuntimeRecoveryOperationalAuditProjectionCertification } from "./local-runtime-recovery-operational-audit-projection-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "./local-runtime-recovery-operational-audit-publication.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublication, type OperationalAuditPublicationReplayDisposition } from "./local-runtime-recovery-operational-audit-publication-replay.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationCertification = Readonly<{
  publicationCertificationId: string;
  publicationId: string;
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
  externalPublicationPerformed: false;
}>;

export function certifyLocalRuntimeRecoveryOperationalAuditPublication(input: { publicationCertificationId: string; envelope: LocalRuntimeRecoveryOperationalAuditPublicationEnvelope; certification: LocalRuntimeRecoveryOperationalAuditProjectionCertification; projection: LocalRuntimeRecoveryOperationalAuditProjection }): LocalRuntimeRecoveryOperationalAuditPublicationCertification {
  if (!input.publicationCertificationId.trim()) throw new Error("Operational audit publication certification identity is required.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationEnvelope(input.envelope, input.certification, input.projection);
  const replayDisposition = replayLocalRuntimeRecoveryOperationalAuditPublication({ envelope: input.envelope, certification: input.certification, projection: input.projection });
  if (replayDisposition === "CONFLICT") throw new Error("Operational audit publication certification conflict.");
  const e = input.envelope;
  return Object.freeze({ publicationCertificationId: input.publicationCertificationId, publicationId: e.publicationId, certificationId: e.certificationId, projectionId: e.projectionId, evidenceCertificationId: e.evidenceCertificationId, evidenceId: e.evidenceId, auditCertificationId: e.auditCertificationId, auditRecordId: e.auditRecordId, closureCertificationId: e.closureCertificationId, closureEvidenceId: e.closureEvidenceId, continuityCertificationId: e.continuityCertificationId, receiptId: e.receiptId, closureId: e.closureId, executionId: e.executionId, dispatchId: e.dispatchId, acknowledgementId: e.acknowledgementId, decisionFingerprint: e.decisionFingerprint, replayDisposition, certified: true, syntheticOnly: true, externalPublicationPerformed: false });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationCertification(input: LocalRuntimeRecoveryOperationalAuditPublicationCertification, envelope: LocalRuntimeRecoveryOperationalAuditPublicationEnvelope): void {
  if (!input.publicationCertificationId.trim() || !input.certified || !input.syntheticOnly || input.externalPublicationPerformed) throw new Error("Operational audit publication certification must be certified, unpublished and synthetic-only.");
  if (input.publicationId !== envelope.publicationId || input.certificationId !== envelope.certificationId || input.projectionId !== envelope.projectionId || input.evidenceCertificationId !== envelope.evidenceCertificationId || input.evidenceId !== envelope.evidenceId || input.auditCertificationId !== envelope.auditCertificationId || input.auditRecordId !== envelope.auditRecordId || input.closureCertificationId !== envelope.closureCertificationId || input.closureEvidenceId !== envelope.closureEvidenceId || input.continuityCertificationId !== envelope.continuityCertificationId || input.receiptId !== envelope.receiptId || input.closureId !== envelope.closureId || input.executionId !== envelope.executionId || input.dispatchId !== envelope.dispatchId || input.acknowledgementId !== envelope.acknowledgementId || input.decisionFingerprint !== envelope.decisionFingerprint) throw new Error("Operational audit publication certification drift.");
}

export type { OperationalAuditPublicationReplayDisposition };
