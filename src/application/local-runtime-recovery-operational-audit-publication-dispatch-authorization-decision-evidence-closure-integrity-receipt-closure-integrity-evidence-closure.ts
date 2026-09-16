import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-closure-integrity-evidence-certification.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure = Readonly<{
  closureId: string;
  evidenceCertificationId: string;
  evidenceId: string;
  integrityCertificationId: string;
  integrityId: string;
  receiptId: string;
  decisionCertificationId: string;
  decisionId: string;
  decisionFingerprint: string;
  closureState: "CLOSED_FOR_REVIEW";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure(input: { closureId: string; evidenceCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure {
  if (!input.closureId.trim()) throw new Error("Terminal receipt closure integrity evidence closure identity is required.");
  const c = input.evidenceCertification;
  if (!c.certified || c.replayDisposition === "CONFLICT" || !c.syntheticOnly) throw new Error("Terminal receipt closure integrity evidence certification is not admissible for closure.");
  return Object.freeze({ closureId: input.closureId, evidenceCertificationId: c.certificationId, evidenceId: c.evidenceId, integrityCertificationId: c.integrityCertificationId, integrityId: c.integrityId, receiptId: c.receiptId, decisionCertificationId: c.decisionCertificationId, decisionId: c.decisionId, decisionFingerprint: c.decisionFingerprint, closureState: "CLOSED_FOR_REVIEW", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceClosure, evidenceCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosureIntegrityEvidenceCertification): void {
  if (!input.closureId.trim() || input.closureState !== "CLOSED_FOR_REVIEW" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || input.durablePublicationCreated || !input.syntheticOnly) throw new Error("Terminal receipt closure integrity evidence closure is invalid or executable.");
  if (!evidenceCertification.certified || evidenceCertification.replayDisposition === "CONFLICT" || !evidenceCertification.syntheticOnly) throw new Error("Terminal receipt closure integrity evidence certification is not admissible for closure.");
  if (input.evidenceCertificationId !== evidenceCertification.certificationId || input.evidenceId !== evidenceCertification.evidenceId || input.integrityCertificationId !== evidenceCertification.integrityCertificationId || input.integrityId !== evidenceCertification.integrityId || input.receiptId !== evidenceCertification.receiptId || input.decisionCertificationId !== evidenceCertification.decisionCertificationId || input.decisionId !== evidenceCertification.decisionId || input.decisionFingerprint !== evidenceCertification.decisionFingerprint) throw new Error("Terminal receipt closure integrity evidence closure identity drift.");
}
