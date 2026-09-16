import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity = Readonly<{
  integrityId: string;
  closureCertificationId: string;
  closureId: string;
  decisionCertificationId: string;
  decisionId: string;
  authorizationCertificationId: string;
  authorizationId: string;
  candidateId: string;
  requestId: string;
  publicationCertificationId: string;
  publicationId: string;
  decisionFingerprint: string;
  integrityState: "VERIFIED_TERMINAL_REVIEW_ARTIFACT";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity(input: { integrityId: string; closureCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureCertification; decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity {
  if (!input.integrityId.trim()) throw new Error("Authorization decision evidence closure integrity identity is required.");
  const c = input.closureCertification;
  if (!c.certified || c.replayDisposition === "CONFLICT" || !c.syntheticOnly) throw new Error("Closed evidence certification is not admissible for integrity verification.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure(c, input.decisionCertification);
  return Object.freeze({ integrityId: input.integrityId, closureCertificationId: c.certificationId, closureId: c.closureId, decisionCertificationId: c.decisionCertificationId, decisionId: c.decisionId, authorizationCertificationId: c.authorizationCertificationId, authorizationId: c.authorizationId, candidateId: c.candidateId, requestId: c.requestId, publicationCertificationId: c.publicationCertificationId, publicationId: c.publicationId, decisionFingerprint: c.decisionFingerprint, integrityState: "VERIFIED_TERMINAL_REVIEW_ARTIFACT", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity, decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification): void {
  if (!input.integrityId.trim() || input.integrityState !== "VERIFIED_TERMINAL_REVIEW_ARTIFACT" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || input.durablePublicationCreated || !input.syntheticOnly) throw new Error("Authorization decision evidence closure integrity is invalid or executable.");
  if (input.closureCertificationId.trim() === "" || input.closureId.trim() === "") throw new Error("Authorization decision evidence closure certification identity is incomplete.");
  if (!decisionCertification.certified || decisionCertification.replayDisposition === "CONFLICT" || !decisionCertification.syntheticOnly) throw new Error("Decision certification is not admissible for integrity verification.");
  if (input.decisionCertificationId !== decisionCertification.certificationId || input.decisionId !== decisionCertification.decisionId || input.authorizationCertificationId !== decisionCertification.authorizationCertificationId || input.authorizationId !== decisionCertification.authorizationId || input.candidateId !== decisionCertification.candidateId || input.requestId !== decisionCertification.requestId || input.publicationCertificationId !== decisionCertification.publicationCertificationId || input.publicationId !== decisionCertification.publicationId || input.decisionFingerprint !== decisionCertification.decisionFingerprint) throw new Error("Authorization decision evidence closure integrity identity drift.");
}
