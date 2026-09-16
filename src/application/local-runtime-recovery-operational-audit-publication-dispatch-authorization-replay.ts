import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "./local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization.js";

export type OperationalAuditPublicationDispatchAuthorizationReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization(input: { authorization: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization; candidate: LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate }): OperationalAuditPublicationDispatchAuthorizationReplayDisposition {
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorization(input.authorization, input.candidate);
  const key = `${input.authorization.authorizationId}:${input.authorization.candidateId}`;
  const previous = registry.get(key);
  if (!previous) { registry.set(key, input.authorization.decisionFingerprint); return "ADMIT"; }
  if (previous === input.authorization.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationReplayRegistry(): void { registry.clear(); }
