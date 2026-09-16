import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-integrity.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt = Readonly<{
  receiptId: string;
  integrityCertificationId: string;
  integrityId: string;
  closureCertificationId: string;
  closureId: string;
  decisionCertificationId: string;
  decisionId: string;
  decisionFingerprint: string;
  receiptState: "RECEIVED_FOR_REVIEW";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt(input: { receiptId: string; integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityCertification; decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt {
  if (!input.receiptId.trim()) throw new Error("Terminal integrity receipt identity is required.");
  const c = input.integrityCertification;
  if (!c.certified || c.replayDisposition === "CONFLICT" || !c.syntheticOnly) throw new Error("Terminal integrity certification is not admissible for receipt.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity(c, input.decisionCertification);
  return Object.freeze({ receiptId: input.receiptId, integrityCertificationId: c.certificationId, integrityId: c.integrityId, closureCertificationId: c.closureCertificationId, closureId: c.closureId, decisionCertificationId: c.decisionCertificationId, decisionId: c.decisionId, decisionFingerprint: c.decisionFingerprint, receiptState: "RECEIVED_FOR_REVIEW", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityReceipt, integrityCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrityCertification, decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification): void {
  if (!input.receiptId.trim() || input.receiptState !== "RECEIVED_FOR_REVIEW" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || input.durablePublicationCreated || !input.syntheticOnly) throw new Error("Terminal integrity receipt is invalid or executable.");
  if (!integrityCertification.certified || integrityCertification.replayDisposition === "CONFLICT" || !integrityCertification.syntheticOnly) throw new Error("Terminal integrity certification is not admissible.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureIntegrity(integrityCertification, decisionCertification);
  if (input.integrityCertificationId !== integrityCertification.certificationId || input.integrityId !== integrityCertification.integrityId || input.closureCertificationId !== integrityCertification.closureCertificationId || input.closureId !== integrityCertification.closureId || input.decisionCertificationId !== integrityCertification.decisionCertificationId || input.decisionId !== integrityCertification.decisionId || input.decisionFingerprint !== integrityCertification.decisionFingerprint) throw new Error("Terminal integrity receipt identity drift.");
}
