import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "./local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationRequestCertification } from "./local-runtime-recovery-operational-audit-publication-request-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "./local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate, type OperationalAuditPublicationDispatchCandidateReplayDisposition } from "./local-runtime-recovery-operational-audit-publication-dispatch-candidate-replay.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateCertification = Readonly<{
  certificationId: string;
  candidateId: string;
  requestCertificationId: string;
  requestId: string;
  publicationCertificationId: string;
  publicationId: string;
  decisionFingerprint: string;
  replayDisposition: OperationalAuditPublicationDispatchCandidateReplayDisposition;
  certified: true;
  syntheticOnly: true;
  externalTransportRequested: false;
  dispatchExecuted: false;
}>;

export function certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate(input: { certificationId: string; candidate: LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate; requestCertification: LocalRuntimeRecoveryOperationalAuditPublicationRequestCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateCertification {
  if (!input.certificationId.trim()) throw new Error("Dispatch candidate certification identity is required.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate(input.candidate, input.requestCertification);
  const replayDisposition = replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate({ candidate: input.candidate, requestCertification: input.requestCertification });
  if (replayDisposition === "CONFLICT") throw new Error("Dispatch candidate certification conflict.");
  return Object.freeze({ certificationId: input.certificationId, candidateId: input.candidate.candidateId, requestCertificationId: input.candidate.requestCertificationId, requestId: input.candidate.requestId, publicationCertificationId: input.candidate.publicationCertificationId, publicationId: input.candidate.publicationId, decisionFingerprint: input.candidate.decisionFingerprint, replayDisposition, certified: true, syntheticOnly: true, externalTransportRequested: false, dispatchExecuted: false });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateCertification(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateCertification, candidate: LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate): void {
  if (!input.certificationId.trim() || !input.candidateId.trim() || !input.certified || !input.syntheticOnly || input.externalTransportRequested || input.dispatchExecuted || input.replayDisposition === "CONFLICT") throw new Error("Dispatch candidate certification is invalid.");
  if (input.candidateId !== candidate.candidateId || input.requestCertificationId !== candidate.requestCertificationId || input.requestId !== candidate.requestId || input.publicationCertificationId !== candidate.publicationCertificationId || input.publicationId !== candidate.publicationId || input.decisionFingerprint !== candidate.decisionFingerprint) throw new Error("Dispatch candidate certification identity drift.");
}
