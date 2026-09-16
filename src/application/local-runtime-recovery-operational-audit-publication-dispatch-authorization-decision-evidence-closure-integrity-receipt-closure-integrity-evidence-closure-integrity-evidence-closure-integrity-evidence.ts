import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-closure-integrity-certification.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityEvidence = Readonly<{
  evidenceId: string;
  integrityCertificationId: string;
  integrityId: string;
  closureCertificationId: string;
  closureId: string;
  evidenceCertificationId: string;
  receiptId: string;
  decisionCertificationId: string;
  decisionId: string;
  decisionFingerprint: string;
  evidenceState: "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_INTEGRITY_EVIDENCE_REVIEW_ARTIFACT";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityEvidence(input: { evidenceId: string; integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityEvidence {
  if (!input.evidenceId.trim()) throw new Error("Terminal evidence closure integrity evidence identity is required.");
  const c = input.integrityCertification;
  if (!c.certified || c.replayDisposition === "CONFLICT" || !c.syntheticOnly) throw new Error("Terminal evidence closure integrity certification is not admissible for evidence verification.");
  if (c.integrityState !== "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT") throw new Error("Terminal evidence closure integrity is not evidence-verifiable.");
  return Object.freeze({ evidenceId: input.evidenceId, integrityCertificationId: c.certificationId, integrityId: c.integrityId, closureCertificationId: c.closureCertificationId, closureId: c.closureId, evidenceCertificationId: c.evidenceCertificationId, receiptId: c.receiptId, decisionCertificationId: c.decisionCertificationId, decisionId: c.decisionId, decisionFingerprint: c.decisionFingerprint, evidenceState: "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_INTEGRITY_EVIDENCE_REVIEW_ARTIFACT", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityEvidence(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityEvidence, integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrityCertification): void {
  if (!input.evidenceId.trim() || input.evidenceState !== "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_INTEGRITY_EVIDENCE_REVIEW_ARTIFACT" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || input.durablePublicationCreated || !input.syntheticOnly) throw new Error("Terminal evidence closure integrity evidence is invalid or executable.");
  if (!integrityCertification.certified || integrityCertification.replayDisposition === "CONFLICT" || !integrityCertification.syntheticOnly) throw new Error("Terminal evidence closure integrity certification is not admissible for evidence verification.");
  if (input.integrityCertificationId !== integrityCertification.certificationId || input.integrityId !== integrityCertification.integrityId || input.closureCertificationId !== integrityCertification.closureCertificationId || input.closureId !== integrityCertification.closureId || input.evidenceCertificationId !== integrityCertification.evidenceCertificationId || input.receiptId !== integrityCertification.receiptId || input.decisionCertificationId !== integrityCertification.decisionCertificationId || input.decisionId !== integrityCertification.decisionId || input.decisionFingerprint !== integrityCertification.decisionFingerprint) throw new Error("Terminal evidence closure integrity evidence identity drift.");
}
