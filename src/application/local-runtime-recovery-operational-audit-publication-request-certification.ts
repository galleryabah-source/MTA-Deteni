import type { LocalRuntimeRecoveryOperationalAuditPublicationCertification } from "./local-runtime-recovery-operational-audit-publication-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "./local-runtime-recovery-operational-audit-publication.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationRequest } from "./local-runtime-recovery-operational-audit-publication-request.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationRequest } from "./local-runtime-recovery-operational-audit-publication-request.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationRequest, type OperationalAuditPublicationRequestReplayDisposition } from "./local-runtime-recovery-operational-audit-publication-request-replay.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationRequestCertification = Readonly<{
  certificationId: string;
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
  replayDisposition: OperationalAuditPublicationRequestReplayDisposition;
  certified: true;
  syntheticOnly: true;
  externalTransportRequested: false;
}>;

export function certifyLocalRuntimeRecoveryOperationalAuditPublicationRequest(input: {
  certificationId: string;
  request: LocalRuntimeRecoveryOperationalAuditPublicationRequest;
  certification: LocalRuntimeRecoveryOperationalAuditPublicationCertification;
  envelope: LocalRuntimeRecoveryOperationalAuditPublicationEnvelope;
}): LocalRuntimeRecoveryOperationalAuditPublicationRequestCertification {
  if (!input.certificationId.trim()) throw new Error("Publication request certification identity is required.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationRequest(input.request, input.certification, input.envelope);
  const replayDisposition = replayLocalRuntimeRecoveryOperationalAuditPublicationRequest({ request: input.request, certification: input.certification, envelope: input.envelope });
  if (replayDisposition === "CONFLICT") throw new Error("Publication request certification conflict.");
  return Object.freeze({
    certificationId: input.certificationId,
    requestId: input.request.requestId,
    publicationCertificationId: input.request.publicationCertificationId,
    publicationId: input.request.publicationId,
    evidenceCertificationId: input.request.evidenceCertificationId,
    evidenceId: input.request.evidenceId,
    auditCertificationId: input.request.auditCertificationId,
    auditRecordId: input.request.auditRecordId,
    closureCertificationId: input.request.closureCertificationId,
    closureEvidenceId: input.request.closureEvidenceId,
    continuityCertificationId: input.request.continuityCertificationId,
    receiptId: input.request.receiptId,
    closureId: input.request.closureId,
    executionId: input.request.executionId,
    dispatchId: input.request.dispatchId,
    acknowledgementId: input.request.acknowledgementId,
    decisionFingerprint: input.request.decisionFingerprint,
    replayDisposition,
    certified: true,
    syntheticOnly: true,
    externalTransportRequested: false,
  });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationRequestCertification(input: LocalRuntimeRecoveryOperationalAuditPublicationRequestCertification, request: LocalRuntimeRecoveryOperationalAuditPublicationRequest): void {
  if (!input.certificationId.trim() || !input.requestId.trim() || !input.certified || !input.syntheticOnly || input.externalTransportRequested || input.replayDisposition === "CONFLICT") throw new Error("Publication request certification is invalid.");
  if (input.requestId !== request.requestId || input.publicationCertificationId !== request.publicationCertificationId || input.publicationId !== request.publicationId || input.decisionFingerprint !== request.decisionFingerprint) throw new Error("Publication request certification identity drift.");
  if (input.executionId !== request.executionId || input.dispatchId !== request.dispatchId || input.acknowledgementId !== request.acknowledgementId) throw new Error("Publication request certification execution identity drift.");
}
