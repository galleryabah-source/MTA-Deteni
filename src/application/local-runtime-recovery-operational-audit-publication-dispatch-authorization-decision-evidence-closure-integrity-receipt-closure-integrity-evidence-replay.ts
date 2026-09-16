import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence.js";

export type OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence(input: { evidence: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence; integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityCertification }): OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceReplayDisposition {
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence(input.evidence, input.integrityCertification);
  const key = `${input.evidence.evidenceId}:${input.evidence.integrityCertificationId}`;
  const previous = registry.get(key);
  if (!previous) { registry.set(key, input.evidence.decisionFingerprint); return "ADMIT"; }
  if (previous === input.evidence.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceReplayRegistry(): void { registry.clear(); }
