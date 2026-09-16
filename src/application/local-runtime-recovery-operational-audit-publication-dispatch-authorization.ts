import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "./local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization = Readonly<{
  authorizationId: string;
  candidateId: string;
  requestCertificationId: string;
  requestId: string;
  publicationCertificationId: string;
  publicationId: string;
  decisionFingerprint: string;
  authorizationState: "READY_FOR_AUTHORIZATION_REVIEW";
  authorizationGranted: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  syntheticOnly: true;
}>;

function assertCandidate(candidate: LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate): void {
  if (!candidate.candidateId.trim() || candidate.candidateState !== "READY_FOR_DISPATCH_REVIEW" || candidate.externalTransportRequested || candidate.dispatchExecuted || !candidate.syntheticOnly) throw new Error("Dispatch candidate is not admissible for authorization review.");
}

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization(input: { authorizationId: string; candidate: LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization {
  if (!input.authorizationId.trim()) throw new Error("Dispatch authorization identity is required.");
  assertCandidate(input.candidate);
  return Object.freeze({ authorizationId: input.authorizationId, candidateId: input.candidate.candidateId, requestCertificationId: input.candidate.requestCertificationId, requestId: input.candidate.requestId, publicationCertificationId: input.candidate.publicationCertificationId, publicationId: input.candidate.publicationId, decisionFingerprint: input.candidate.decisionFingerprint, authorizationState: "READY_FOR_AUTHORIZATION_REVIEW", authorizationGranted: false, externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization, candidate: LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate): void {
  if (!input.authorizationId.trim() || input.authorizationState !== "READY_FOR_AUTHORIZATION_REVIEW" || input.authorizationGranted || input.externalTransportRequested || input.dispatchExecuted || !input.syntheticOnly) throw new Error("Dispatch authorization is invalid or has attempted execution.");
  assertCandidate(candidate);
  if (input.candidateId !== candidate.candidateId || input.requestCertificationId !== candidate.requestCertificationId || input.requestId !== candidate.requestId || input.publicationCertificationId !== candidate.publicationCertificationId || input.publicationId !== candidate.publicationId || input.decisionFingerprint !== candidate.decisionFingerprint) throw new Error("Dispatch authorization identity drift.");
}
