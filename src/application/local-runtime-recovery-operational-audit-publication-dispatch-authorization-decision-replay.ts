import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision.js";

export type OperationalAuditPublicationDispatchAuthorizationDecisionReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision(input: { decision: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision; certification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification }): OperationalAuditPublicationDispatchAuthorizationDecisionReplayDisposition {
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision(input.decision, input.certification);
  const key = `${input.decision.decisionId}:${input.decision.authorizationCertificationId}`;
  const previous = registry.get(key);
  if (!previous) { registry.set(key, input.decision.decisionFingerprint); return "ADMIT"; }
  if (previous === input.decision.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionReplayRegistry(): void { registry.clear(); }
