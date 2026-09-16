import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure = Readonly<LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence & {
  closureId: string;
  closureState: "CLOSED_FOR_REVIEW";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
}>;

export function createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure(input: { closureId: string; evidence: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence; decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure {
  if (!input.closureId.trim()) throw new Error("Authorization decision evidence closure identity is required.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence(input.evidence, input.decisionCertification);
  return Object.freeze({ ...input.evidence, closureId: input.closureId, closureState: "CLOSED_FOR_REVIEW", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false });
}

export function assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure(input: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure, decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification): void {
  if (!input.closureId.trim() || input.closureState !== "CLOSED_FOR_REVIEW" || input.authorizationGranted || input.dispatchApproved || input.externalTransportRequested || input.dispatchExecuted || input.durablePublicationCreated || !input.syntheticOnly) throw new Error("Authorization decision evidence closure is invalid or executable.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence(input, decisionCertification);
}
