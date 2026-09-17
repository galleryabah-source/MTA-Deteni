import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-integrity.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-integrity.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence.js";

export type TerminalEvidenceIntegrityReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrityReplayRegistry(): void { registry.clear(); }

export function replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity(input: { integrity: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity; evidence: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence }): TerminalEvidenceIntegrityReplayDisposition {
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity(input.integrity);
  if (input.integrity.evidenceId !== input.evidence.evidenceId || input.integrity.integrityCertificationId !== input.evidence.integrityCertificationId || input.integrity.evidenceCertificationId !== input.evidence.evidenceCertificationId || input.integrity.closureCertificationId !== input.evidence.closureCertificationId || input.integrity.closureId !== input.evidence.closureId || input.integrity.receiptId !== input.evidence.receiptId || input.integrity.decisionCertificationId !== input.evidence.decisionCertificationId || input.integrity.decisionId !== input.evidence.decisionId || input.integrity.decisionFingerprint !== input.evidence.decisionFingerprint) throw new Error("Terminal evidence integrity evidence identity drift.");
  const key = `${input.integrity.integrityId}:${input.evidence.integrityCertificationId}:${input.evidence.evidenceId}`;
  const existing = registry.get(key);
  if (existing === undefined) { registry.set(key, input.integrity.decisionFingerprint); return "ADMIT"; }
  if (existing === input.integrity.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}
