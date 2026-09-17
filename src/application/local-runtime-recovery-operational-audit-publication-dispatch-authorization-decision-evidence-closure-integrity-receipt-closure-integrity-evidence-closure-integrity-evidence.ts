import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-closure-integrity-certification.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence = Readonly<{
  evidenceId: string;
  integrityCertificationId: string;
  integrityId: string;
  closureCertificationId: string;
  closureId: string;
  evidenceCertificationId: string;
  evidenceIdSource: string;
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

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceShape(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence): void {
  if (!input.evidenceId.trim() || input.evidenceState !== "READY_FOR_REVIEW" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || input.durablePublicationCreated || !input.syntheticOnly) throw new Error("Terminal evidence closure integrity evidence is invalid or executable.");
  if (!input.integrityCertificationId.trim() || !input.integrityId.trim() || !input.closureCertificationId.trim() || !input.closureId.trim() || !input.evidenceCertificationId.trim() || !input.evidenceIdSource.trim() || !input.receiptId.trim() || !input.decisionCertificationId.trim() || !input.decisionId.trim() || !input.decisionFingerprint.trim()) throw new Error("Terminal evidence closure integrity evidence identity is incomplete.");
}

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence(input: { evidenceId: string; integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence {
  if (!input.evidenceId.trim()) throw new Error("Terminal evidence closure integrity evidence identity is required.");
  const c = input.integrityCertification;
  if (!c.certified || c.replayDisposition === "CONFLICT" || !c.syntheticOnly) throw new Error("Terminal evidence closure integrity certification is not admissible for evidence.");
  if (c.integrityState !== "VERIFIED_TERMINAL_EVIDENCE_CLOSURE_REVIEW_ARTIFACT") throw new Error("Terminal evidence closure integrity state is not review-verifiable.");
  return Object.freeze({ evidenceId: input.evidenceId, integrityCertificationId: c.certificationId, integrityId: c.integrityId, closureCertificationId: c.closureCertificationId, closureId: c.closureId, evidenceCertificationId: c.evidenceCertificationId, evidenceIdSource: c.evidenceId, receiptId: c.receiptId, decisionCertificationId: c.decisionCertificationId, decisionId: c.decisionId, decisionFingerprint: c.decisionFingerprint, evidenceState: "READY_FOR_REVIEW", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidence, integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityCertification): void {
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosureIntegrityEvidenceShape(input);
  if (!integrityCertification.certified || integrityCertification.replayDisposition === "CONFLICT" || !integrityCertification.syntheticOnly) throw new Error("Terminal evidence closure integrity certification is not admissible for evidence.");
  if (input.integrityCertificationId !== integrityCertification.certificationId || input.integrityId !== integrityCertification.integrityId || input.closureCertificationId !== integrityCertification.closureCertificationId || input.closureId !== integrityCertification.closureId || input.evidenceCertificationId !== integrityCertification.evidenceCertificationId || input.evidenceIdSource !== integrityCertification.evidenceId || input.receiptId !== integrityCertification.receiptId || input.decisionCertificationId !== integrityCertification.decisionCertificationId || input.decisionId !== integrityCertification.decisionId || input.decisionFingerprint !== integrityCertification.decisionFingerprint) throw new Error("Terminal evidence closure integrity evidence identity drift.");
}