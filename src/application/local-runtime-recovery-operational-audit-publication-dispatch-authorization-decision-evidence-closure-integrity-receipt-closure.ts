import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-receipt.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure = Readonly<{
  closureId: string;
  receiptCertificationId: string;
  receiptId: string;
  integrityCertificationId: string;
  integrityId: string;
  evidenceClosureIntegrityReceiptClosureState: "CLOSED_FOR_REVIEW";
  decisionCertificationId: string;
  decisionId: string;
  decisionFingerprint: string;
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure(input: { closureId: string; receiptCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptCertification; integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityCertification; decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure {
  if (!input.closureId.trim()) throw new Error("Terminal integrity receipt closure identity is required.");
  const r = input.receiptCertification;
  if (!r.certified || r.replayDisposition === "CONFLICT" || !r.syntheticOnly) throw new Error("Terminal integrity receipt certification is not admissible for closure.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt(r, input.integrityCertification, input.decisionCertification);
  if (r.integrityCertificationId !== input.integrityCertification.certificationId) throw new Error("Terminal receipt integrity certification continuity failure.");
  return Object.freeze({ closureId: input.closureId, receiptCertificationId: r.certificationId, receiptId: r.receiptId, integrityCertificationId: r.integrityCertificationId, integrityId: r.integrityId, evidenceClosureIntegrityReceiptClosureState: "CLOSED_FOR_REVIEW", decisionCertificationId: r.decisionCertificationId, decisionId: r.decisionId, decisionFingerprint: r.decisionFingerprint, authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptClosure, receiptCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceiptCertification, integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityCertification, decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification): void {
  if (!input.closureId.trim() || input.evidenceClosureIntegrityReceiptClosureState !== "CLOSED_FOR_REVIEW" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || input.durablePublicationCreated || !input.syntheticOnly) throw new Error("Terminal integrity receipt closure is invalid or executable.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt(receiptCertification, integrityCertification, decisionCertification);
  if (input.receiptCertificationId !== receiptCertification.certificationId || input.receiptId !== receiptCertification.receiptId || input.integrityCertificationId !== receiptCertification.integrityCertificationId || input.integrityId !== receiptCertification.integrityId || input.decisionCertificationId !== receiptCertification.decisionCertificationId || input.decisionId !== receiptCertification.decisionId || input.decisionFingerprint !== receiptCertification.decisionFingerprint) throw new Error("Terminal integrity receipt closure identity drift.");
}
