import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity.js";

export type OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity(input: { integrity: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity; closureCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureCertification }): OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReplayDisposition {
  const decisionCertification = { ...input.closureCertification, certificationId: input.closureCertification.decisionCertificationId, decisionState: "REVIEW_REQUIRED" as const };
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity({ ...input.integrity, decisionFingerprint: decisionCertification.decisionFingerprint }, decisionCertification);
  const key = `${input.integrity.integrityId}:${input.integrity.closureCertificationId}`;
  const previous = registry.get(key);
  if (!previous) { registry.set(key, input.integrity.decisionFingerprint); return "ADMIT"; }
  if (previous === input.integrity.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReplayRegistry(): void { registry.clear(); }
