import type { LocalRuntimeRecoveryOperationalAuditProjectionCertification } from "./local-runtime-recovery-operational-audit-projection-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditProjection } from "./local-runtime-recovery-operational-audit-projection.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationEnvelope = Readonly<{
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
  publicationState: "READY_FOR_PUBLICATION";
  publicationReady: true;
  externallyPublished: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationEnvelope(input: {
  publicationId: string;
  certification: LocalRuntimeRecoveryOperationalAuditProjectionCertification;
  projection: LocalRuntimeRecoveryOperationalAuditProjection;
}): LocalRuntimeRecoveryOperationalAuditPublicationEnvelope {
  if (!input.publicationId.trim()) throw new Error("Operational audit publication identity is required.");
  const c = input.certification;
  const p = input.projection;
  if (!c.certified || !c.syntheticOnly || c.replayDisposition === "CONFLICT") throw new Error("Operational audit publication requires certified, non-conflicted synthetic certification.");
  if (c.projectionId !== p.projectionId || c.evidenceCertificationId !== p.evidenceCertificationId || c.evidenceId !== p.evidenceId || c.auditCertificationId !== p.auditCertificationId || c.auditRecordId !== p.auditRecordId || c.closureCertificationId !== p.closureCertificationId || c.closureEvidenceId !== p.closureEvidenceId || c.continuityCertificationId !== p.continuityCertificationId || c.receiptId !== p.receiptId || c.closureId !== p.closureId || c.executionId !== p.executionId || c.dispatchId !== p.dispatchId || c.acknowledgementId !== p.acknowledgementId || c.decisionFingerprint !== p.decisionFingerprint) throw new Error("Operational audit publication source identity drift.");
  if (!p.complete || !p.syntheticOnly || p.projectionState !== "READY") throw new Error("Operational audit publication requires a complete READY synthetic projection.");
  return Object.freeze({ publicationId: input.publicationId, certificationId: c.certificationId, projectionId: p.projectionId, evidenceCertificationId: p.evidenceCertificationId, evidenceId: p.evidenceId, auditCertificationId: p.auditCertificationId, auditRecordId: p.auditRecordId, closureCertificationId: p.closureCertificationId, closureEvidenceId: p.closureEvidenceId, continuityCertificationId: p.continuityCertificationId, receiptId: p.receiptId, closureId: p.closureId, executionId: p.executionId, dispatchId: p.dispatchId, acknowledgementId: p.acknowledgementId, decisionFingerprint: p.decisionFingerprint, publicationState: "READY_FOR_PUBLICATION", publicationReady: true, externallyPublished: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationEnvelope(input: LocalRuntimeRecoveryOperationalAuditPublicationEnvelope, certification: LocalRuntimeRecoveryOperationalAuditProjectionCertification, projection: LocalRuntimeRecoveryOperationalAuditProjection): void {
  if (!input.publicationId.trim() || !input.publicationReady || input.publicationState !== "READY_FOR_PUBLICATION" || input.externallyPublished || !input.syntheticOnly) throw new Error("Operational audit publication envelope must remain ready, unpublished and synthetic-only.");
  if (input.certificationId !== certification.certificationId || input.projectionId !== projection.projectionId || input.evidenceCertificationId !== projection.evidenceCertificationId || input.evidenceId !== projection.evidenceId || input.auditCertificationId !== projection.auditCertificationId || input.auditRecordId !== projection.auditRecordId || input.closureCertificationId !== projection.closureCertificationId || input.closureEvidenceId !== projection.closureEvidenceId || input.continuityCertificationId !== projection.continuityCertificationId || input.receiptId !== projection.receiptId || input.closureId !== projection.closureId || input.executionId !== projection.executionId || input.dispatchId !== projection.dispatchId || input.acknowledgementId !== projection.acknowledgementId || input.decisionFingerprint !== projection.decisionFingerprint) throw new Error("Operational audit publication envelope identity drift.");
  if (!certification.certified || !certification.syntheticOnly || certification.replayDisposition === "CONFLICT") throw new Error("Operational audit publication certification is not admissible.");
  if (!projection.complete || !projection.syntheticOnly || projection.projectionState !== "READY") throw new Error("Operational audit publication projection is not admissible.");
}
