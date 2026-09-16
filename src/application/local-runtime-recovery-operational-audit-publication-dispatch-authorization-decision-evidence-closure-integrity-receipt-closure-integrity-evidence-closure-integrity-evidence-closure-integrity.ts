import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-evidence-closure-certification.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity = Readonly<{
  integrityId: string;
  closureCertificationId: string;
  closureId: string;
  evidenceCertificationId: string;
  evidenceId: string;
  integrityCertificationId: string;
  receiptId: string;
  decisionCertificationId: string;
  decisionId: string;
  decisionFingerprint: string;
  integrityState: "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity(input: { integrityId: string; closureCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity {
  if (!input.integrityId.trim()) throw new Error("Terminal evidence closure integrity evidence closure integrity identity is required.");
  const c = input.closureCertification;
  if (!c.certified || c.replayDisposition === "CONFLICT" || !c.syntheticOnly) throw new Error("Terminal evidence closure integrity evidence closure certification is not admissible for integrity verification.");
  if (c.closureState !== "CLOSED_FOR_REVIEW") throw new Error("Terminal evidence closure integrity evidence closure is not integrity-verifiable.");
  return Object.freeze({ integrityId: input.integrityId, closureCertificationId: c.certificationId, closureId: c.closureId, evidenceCertificationId: c.evidenceCertificationId, evidenceId: c.evidenceId, integrityCertificationId: c.integrityCertificationId, receiptId: c.receiptId, decisionCertificationId: c.decisionCertificationId, decisionId: c.decisionId, decisionFingerprint: c.decisionFingerprint, integrityState: "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureIntegrity, closureCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceClosureCertification): void {
  if (!input.integrityId.trim() || input.integrityState !== "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || input.durablePublicationCreated || !input.syntheticOnly) throw new Error("Terminal evidence closure integrity evidence closure integrity is invalid or executable.");
  if (!closureCertification.certified || closureCertification.replayDisposition === "CONFLICT" || !closureCertification.syntheticOnly) throw new Error("Terminal evidence closure integrity evidence closure certification is not admissible for integrity verification.");
  if (input.closureCertificationId !== closureCertification.certificationId || input.closureId !== closureCertification.closureId || input.evidenceCertificationId !== closureCertification.evidenceCertificationId || input.evidenceId !== closureCertification.evidenceId || input.integrityCertificationId !== closureCertification.integrityCertificationId || input.receiptId !== closureCertification.receiptId || input.decisionCertificationId !== closureCertification.decisionCertificationId || input.decisionId !== closureCertification.decisionId || input.decisionFingerprint !== closureCertification.decisionFingerprint) throw new Error("Terminal evidence closure integrity evidence closure integrity identity drift.");
}
