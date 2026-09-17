import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceShape } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity = Readonly<{
  integrityId: string;
  evidenceId: string;
  integrityCertificationId: string;
  closureCertificationId: string;
  closureId: string;
  evidenceCertificationId: string;
  evidenceIdSource: string;
  receiptId: string;
  decisionCertificationId: string;
  decisionId: string;
  decisionFingerprint: string;
  integrityState: "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_INTEGRITY_EVIDENCE_REVIEW_ARTIFACT";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity(input: { integrityId: string; evidence: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity {
  if (!input.integrityId.trim()) throw new Error("Terminal evidence integrity evidence integrity identity is required.");
  const e = input.evidence;
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceShape(e);
  return Object.freeze({ integrityId: input.integrityId, evidenceId: e.evidenceId, integrityCertificationId: e.integrityCertificationId, closureCertificationId: e.closureCertificationId, closureId: e.closureId, evidenceCertificationId: e.evidenceCertificationId, evidenceIdSource: e.evidenceIdSource, receiptId: e.receiptId, decisionCertificationId: e.decisionCertificationId, decisionId: e.decisionId, decisionFingerprint: e.decisionFingerprint, integrityState: "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_INTEGRITY_EVIDENCE_REVIEW_ARTIFACT", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceIntegrity): void {
  if (!input.integrityId.trim() || input.integrityState !== "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_INTEGRITY_EVIDENCE_REVIEW_ARTIFACT" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || input.durablePublicationCreated || !input.syntheticOnly) throw new Error("Terminal evidence integrity evidence is invalid or executable.");
  if (!input.evidenceId.trim() || !input.integrityCertificationId.trim() || !input.closureCertificationId.trim() || !input.closureId.trim() || !input.evidenceCertificationId.trim() || !input.evidenceIdSource.trim() || !input.receiptId.trim() || !input.decisionCertificationId.trim() || !input.decisionId.trim() || !input.decisionFingerprint.trim()) throw new Error("Terminal evidence integrity evidence identity is incomplete.");
}
