import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "./local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization, type OperationalAuditPublicationDispatchAuthorizationReplayDisposition } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-replay.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification = Readonly<LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization & { certificationId: string; replayDisposition: OperationalAuditPublicationDispatchAuthorizationReplayDisposition; certified: true }>;

export function certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization(input: { certificationId: string; authorization?: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization; authorizationId?: string; candidate: LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification {
  if (!input.certificationId.trim()) throw new Error("Dispatch authorization certification identity is required.");
  const authorization = input.authorization ?? createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ authorizationId: input.authorizationId ?? "", candidate: input.candidate });
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization(authorization, input.candidate);
  const replayDisposition = replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization({ authorization, candidate: input.candidate });
  if (replayDisposition === "CONFLICT") throw new Error("Dispatch authorization certification replay conflict.");
  return Object.freeze({ ...authorization, certificationId: input.certificationId, replayDisposition, certified: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification, authorization: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization): void {
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization(input, { candidateId: authorization.candidateId, requestCertificationId: authorization.requestCertificationId, requestId: authorization.requestId, publicationCertificationId: authorization.publicationCertificationId, publicationId: authorization.publicationId, decisionFingerprint: authorization.decisionFingerprint, candidateState: "READY_FOR_DISPATCH_REVIEW", externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true });
  if (!input.certified || input.replayDisposition === "CONFLICT" || input.authorizationId !== authorization.authorizationId || input.candidateId !== authorization.candidateId || input.decisionFingerprint !== authorization.decisionFingerprint) throw new Error("Dispatch authorization certification is invalid or drifted.");
}
