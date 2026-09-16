import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-certification.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision = Readonly<{
  decisionId: string;
  authorizationCertificationId: string;
  authorizationId: string;
  candidateId: string;
  requestId: string;
  publicationCertificationId: string;
  publicationId: string;
  decisionFingerprint: string;
  decisionState: "REVIEW_REQUIRED";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision(input: { decisionId: string; authorizationCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision {
  if (!input.decisionId.trim()) throw new Error("Authorization decision identity is required.");
  const c = input.authorizationCertification;
  if (!c.certified || c.replayDisposition === "CONFLICT" || !c.syntheticOnly || c.authorizationGranted || c.externalTransportRequested || c.dispatchExecuted) throw new Error("Authorization decision requires certified, non-conflicted, synthetic review-only authorization.");
  return Object.freeze({ decisionId: input.decisionId, authorizationCertificationId: c.certificationId, authorizationId: c.authorizationId, candidateId: c.candidateId, requestId: c.requestId, publicationCertificationId: c.publicationCertificationId, publicationId: c.publicationId, decisionFingerprint: c.decisionFingerprint, decisionState: "REVIEW_REQUIRED", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision, certification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification): void {
  if (!input.decisionId.trim() || input.decisionState !== "REVIEW_REQUIRED" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || !input.syntheticOnly) throw new Error("Authorization decision is invalid or grants execution.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification(certification, certification);
  if (input.authorizationCertificationId !== certification.certificationId || input.authorizationId !== certification.authorizationId || input.candidateId !== certification.candidateId || input.requestId !== certification.requestId || input.publicationCertificationId !== certification.publicationCertificationId || input.publicationId !== certification.publicationId || input.decisionFingerprint !== certification.decisionFingerprint) throw new Error("Authorization decision identity drift.");
}
