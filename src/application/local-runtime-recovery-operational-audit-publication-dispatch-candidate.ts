import type { LocalRuntimeRecoveryOperationalAuditPublicationRequestCertification } from "./local-runtime-recovery-operational-audit-publication-request-certification.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate = Readonly<{
  candidateId: string;
  requestCertificationId: string;
  requestId: string;
  publicationCertificationId: string;
  publicationId: string;
  decisionFingerprint: string;
  candidateState: "READY_FOR_DISPATCH_REVIEW";
  externalTransportRequested: false;
  dispatchExecuted: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate(input: { candidateId: string; requestCertification: LocalRuntimeRecoveryOperationalAuditPublicationRequestCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate {
  if (!input.candidateId.trim()) throw new Error("Publication dispatch candidate identity is required.");
  const c = input.requestCertification;
  if (!c.certified || !c.syntheticOnly || c.replayDisposition === "CONFLICT" || c.externalTransportRequested) throw new Error("Dispatch candidate requires certified synthetic publication request without external transport.");
  return Object.freeze({ candidateId: input.candidateId, requestCertificationId: c.certificationId, requestId: c.requestId, publicationCertificationId: c.publicationCertificationId, publicationId: c.publicationId, decisionFingerprint: c.decisionFingerprint, candidateState: "READY_FOR_DISPATCH_REVIEW", externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate, requestCertification: LocalRuntimeRecoveryOperationalAuditPublicationRequestCertification): void {
  if (!input.candidateId.trim() || input.candidateState !== "READY_FOR_DISPATCH_REVIEW" || input.externalTransportRequested || input.dispatchExecuted || !input.syntheticOnly) throw new Error("Publication dispatch candidate is invalid or has attempted execution.");
  if (!requestCertification.certified || !requestCertification.syntheticOnly || requestCertification.replayDisposition === "CONFLICT") throw new Error("Publication request certification is not admissible for dispatch review.");
  if (input.requestCertificationId !== requestCertification.certificationId || input.requestId !== requestCertification.requestId || input.publicationCertificationId !== requestCertification.publicationCertificationId || input.publicationId !== requestCertification.publicationId || input.decisionFingerprint !== requestCertification.decisionFingerprint) throw new Error("Publication dispatch candidate identity drift.");
}
