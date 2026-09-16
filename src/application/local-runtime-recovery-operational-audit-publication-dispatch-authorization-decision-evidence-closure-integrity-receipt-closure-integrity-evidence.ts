import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrity } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-certification.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence = Readonly<{
  evidenceId: string;
  integrityCertificationId: string;
  integrityId: string;
  closureCertificationId: string;
  closureId: string;
  receiptId: string;
  decisionCertificationId: string;
  decisionId: string;
  decisionFingerprint: string;
  evidenceState: "READY_FOR_REVIEW";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence(input: { evidenceId: string; integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence {
  if (!input.evidenceId.trim()) throw new Error("Terminal receipt closure integrity evidence identity is required.");
  const c = input.integrityCertification;
  if (!c.certified || c.replayDisposition === "CONFLICT" || !c.syntheticOnly) throw new Error("Terminal receipt closure integrity certification is not admissible for evidence.");
  if (c.integrityState !== "VERIFIED_TERMINAL_RECEIPT_CLOSURE_REVIEW_ARTIFACT") throw new Error("Terminal receipt closure integrity state is not review-verifiable.");
  return Object.freeze({ evidenceId: input.evidenceId, integrityCertificationId: c.certificationId, integrityId: c.integrityId, closureCertificationId: c.closureCertificationId, closureId: c.closureId, receiptId: c.receiptId, decisionCertificationId: c.decisionCertificationId, decisionId: c.decisionId, decisionFingerprint: c.decisionFingerprint, evidenceState: "READY_FOR_REVIEW", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidence, integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityCertification): void {
  if (!input.evidenceId.trim() || input.evidenceState !== "READY_FOR_REVIEW" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || input.durablePublicationCreated || !input.syntheticOnly) throw new Error("Terminal receipt closure integrity evidence is invalid or executable.");
  if (!integrityCertification.certified || integrityCertification.replayDisposition === "CONFLICT" || !integrityCertification.syntheticOnly) throw new Error("Terminal receipt closure integrity certification is not admissible for evidence.");
  if (input.integrityCertificationId !== integrityCertification.certificationId || input.integrityId !== integrityCertification.integrityId || input.closureCertificationId !== integrityCertification.closureCertificationId || input.closureId !== integrityCertification.closureId || input.receiptId !== integrityCertification.receiptId || input.decisionCertificationId !== integrityCertification.decisionCertificationId || input.decisionId !== integrityCertification.decisionId || input.decisionFingerprint !== integrityCertification.decisionFingerprint) throw new Error("Terminal receipt closure integrity evidence identity drift.");
}
