import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure.js";

export type OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure(input: { closure: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure; decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification }): OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureReplayDisposition {
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure(input.closure, input.decisionCertification);
  const key = `${input.closure.closureId}:${input.closure.evidenceId}:${input.closure.decisionCertificationId}`;
  const previous = registry.get(key);
  if (!previous) { registry.set(key, input.closure.decisionFingerprint); return "ADMIT"; }
  if (previous === input.closure.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureReplayRegistry(): void { registry.clear(); }
