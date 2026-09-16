import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence = Readonly<{
  evidenceId: string;
  decisionCertificationId: string;
  decisionId: string;
  authorizationCertificationId: string;
  authorizationId: string;
  candidateId: string;
  requestId: string;
  publicationCertificationId: string;
  publicationId: string;
  decisionFingerprint: string;
  evidenceState: "READY_FOR_REVIEW";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence(input: { evidenceId: string; decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence {
  if (!input.evidenceId.trim()) throw new Error("Authorization decision evidence identity is required.");
  const c = input.decisionCertification;
  if (!c.certified || c.replayDisposition === "CONFLICT" || !c.syntheticOnly || c.authorizationGranted || c.dispatchApproved || c.externalTransportRequested || c.dispatchExecuted) throw new Error("Authorization decision evidence requires certified non-granting review state.");
  return Object.freeze({ evidenceId: input.evidenceId, decisionCertificationId: c.certificationId, decisionId: c.decisionId, authorizationCertificationId: c.authorizationCertificationId, authorizationId: c.authorizationId, candidateId: c.candidateId, requestId: c.requestId, publicationCertificationId: c.publicationCertificationId, publicationId: c.publicationId, decisionFingerprint: c.decisionFingerprint, evidenceState: "READY_FOR_REVIEW", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence, certification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification): void {
  if (!input.evidenceId.trim() || input.evidenceState !== "READY_FOR_REVIEW" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || !input.syntheticOnly) throw new Error("Authorization decision evidence is invalid or executable.");
  if (!certification.certified || certification.replayDisposition === "CONFLICT" || !certification.syntheticOnly) throw new Error("Authorization decision certification is not admissible as evidence.");
  if (input.decisionCertificationId !== certification.certificationId || input.decisionId !== certification.decisionId || input.authorizationCertificationId !== certification.authorizationCertificationId || input.authorizationId !== certification.authorizationId || input.candidateId !== certification.candidateId || input.requestId !== certification.requestId || input.publicationCertificationId !== certification.publicationCertificationId || input.publicationId !== certification.publicationId || input.decisionFingerprint !== certification.decisionFingerprint) throw new Error("Authorization decision evidence identity drift.");
}
