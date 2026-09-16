import type { LocalRuntimeRecoveryOperationalAuditPublicationCertification } from "./local-runtime-recovery-operational-audit-publication-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "./local-runtime-recovery-operational-audit-publication.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationRequest = Readonly<{
  requestId: string;
  publicationCertificationId: string;
  publicationId: string;
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
  requestState: "ADMITTED";
  externalTransportRequested: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationRequest(input: {
  requestId: string;
  certification: LocalRuntimeRecoveryOperationalAuditPublicationCertification;
  envelope: LocalRuntimeRecoveryOperationalAuditPublicationEnvelope;
}): LocalRuntimeRecoveryOperationalAuditPublicationRequest {
  if (!input.requestId.trim()) throw new Error("Publication request identity is required.");
  const c = input.certification;
  const e = input.envelope;
  if (!c.certified || !c.syntheticOnly || c.replayDisposition === "CONFLICT" || c.externalPublicationPerformed) throw new Error("Publication request requires certified, non-conflicted, unpublished synthetic certification.");
  if (!e.publicationReady || e.publicationState !== "READY_FOR_PUBLICATION" || e.externallyPublished || !e.syntheticOnly) throw new Error("Publication request requires READY_FOR_PUBLICATION synthetic envelope with no external publication.");
  if (c.publicationId !== e.publicationId || c.publicationCertificationId !== e.publicationCertificationId || c.decisionFingerprint !== e.decisionFingerprint) throw new Error("Publication request source identity drift.");
  return Object.freeze({
    requestId: input.requestId,
    publicationCertificationId: c.publicationCertificationId,
    publicationId: e.publicationId,
    evidenceCertificationId: e.evidenceCertificationId,
    evidenceId: e.evidenceId,
    auditCertificationId: e.auditCertificationId,
    auditRecordId: e.auditRecordId,
    closureCertificationId: e.closureCertificationId,
    closureEvidenceId: e.closureEvidenceId,
    continuityCertificationId: e.continuityCertificationId,
    receiptId: e.receiptId,
    closureId: e.closureId,
    executionId: e.executionId,
    dispatchId: e.dispatchId,
    acknowledgementId: e.acknowledgementId,
    decisionFingerprint: e.decisionFingerprint,
    requestState: "ADMITTED",
    externalTransportRequested: false,
    syntheticOnly: true,
  });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationRequest(input: LocalRuntimeRecoveryOperationalAuditPublicationRequest, certification: LocalRuntimeRecoveryOperationalAuditPublicationCertification, envelope: LocalRuntimeRecoveryOperationalAuditPublicationEnvelope): void {
  if (!input.requestId.trim() || input.requestState !== "ADMITTED" || input.externalTransportRequested || !input.syntheticOnly) throw new Error("Publication request must be admitted, synthetic-only and transport-free.");
  if (!certification.certified || certification.replayDisposition === "CONFLICT" || certification.externalPublicationPerformed || !certification.syntheticOnly) throw new Error("Publication certification is not admissible.");
  if (!envelope.publicationReady || envelope.publicationState !== "READY_FOR_PUBLICATION" || envelope.externallyPublished || !envelope.syntheticOnly) throw new Error("Publication envelope is not admissible.");
  if (input.publicationCertificationId !== certification.publicationCertificationId || input.publicationId !== envelope.publicationId || input.decisionFingerprint !== envelope.decisionFingerprint || input.executionId !== envelope.executionId || input.dispatchId !== envelope.dispatchId || input.acknowledgementId !== envelope.acknowledgementId) throw new Error("Publication request identity drift.");
}
