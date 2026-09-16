import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence.js";

export type OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence(input: { evidence: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence; certification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification }): OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceReplayDisposition {
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence(input.evidence, input.certification);
  const key = `${input.evidence.evidenceId}:${input.evidence.decisionCertificationId}`;
  const previous = registry.get(key);
  if (!previous) { registry.set(key, input.evidence.decisionFingerprint); return "ADMIT"; }
  if (previous === input.evidence.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceReplayRegistry(): void { registry.clear(); }
