import { assertLocalRuntimeRecoveryDecisionIntegrity, type LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";
import { assertLocalRuntimeRecoveryCertification, type LocalRuntimeRecoveryCertification } from "./local-runtime-recovery-certification.js";
import { assertLocalRuntimeRecoveryDecisionAuditEvidence, type LocalRuntimeRecoveryDecisionAuditEvidence } from "./local-runtime-recovery-decision-audit.js";
import type { LocalRuntimeSafetyCertificationEnvelope } from "./local-runtime-safety-certification.js";

export type LocalRuntimeRecoveryDecisionCertification = Readonly<{
  certificationId: string;
  decisionId: string;
  auditEvidenceId: string;
  envelopeId: string;
  continuityState: LocalRuntimeRecoveryDecision["continuityState"];
  action: LocalRuntimeRecoveryDecision["action"];
  admitted: boolean;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeRecoveryDecision(input: { certificationId: string; decision: LocalRuntimeRecoveryDecision; recoveryCertification: LocalRuntimeRecoveryCertification; auditEvidence: LocalRuntimeRecoveryDecisionAuditEvidence; envelope: LocalRuntimeSafetyCertificationEnvelope }): LocalRuntimeRecoveryDecisionCertification {
  if (!input.certificationId.trim()) throw new Error("Local runtime recovery decision certification identity is required.");
  assertLocalRuntimeRecoveryDecisionIntegrity(input.decision, input.envelope);
  assertLocalRuntimeRecoveryCertification(input.recoveryCertification);
  assertLocalRuntimeRecoveryDecisionAuditEvidence(input.auditEvidence, input.decision);
  if (input.recoveryCertification.envelopeId !== input.envelope.envelopeId || input.recoveryCertification.continuityState !== input.decision.continuityState || input.recoveryCertification.admitted !== input.decision.admitted) throw new Error("Local runtime recovery certification drift.");
  return Object.freeze({ certificationId: input.certificationId, decisionId: input.decision.decisionId, auditEvidenceId: input.auditEvidence.auditEvidenceId, envelopeId: input.envelope.envelopeId, continuityState: input.decision.continuityState, action: input.decision.action, admitted: input.decision.admitted, certified: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryDecisionCertification(certification: LocalRuntimeRecoveryDecisionCertification, decision: LocalRuntimeRecoveryDecision, auditEvidence: LocalRuntimeRecoveryDecisionAuditEvidence, envelope: LocalRuntimeSafetyCertificationEnvelope): void {
  if (!certification.certified || !certification.syntheticOnly) throw new Error("Local runtime recovery decision certification must be synthetic-only.");
  if (!certification.certificationId.trim()) throw new Error("Local runtime recovery decision certification identity is required.");
  assertLocalRuntimeRecoveryDecisionIntegrity(decision, envelope);
  assertLocalRuntimeRecoveryDecisionAuditEvidence(auditEvidence, decision);
  if (certification.decisionId !== decision.decisionId || certification.auditEvidenceId !== auditEvidence.auditEvidenceId || certification.envelopeId !== envelope.envelopeId || certification.continuityState !== decision.continuityState || certification.action !== decision.action || certification.admitted !== decision.admitted) throw new Error("Local runtime recovery decision certification drift.");
  if ((certification.continuityState === "OPERATOR_REVIEW_REQUIRED" || certification.continuityState === "RECONCILIATION_REQUIRED") && certification.admitted) throw new Error("Blocked recovery decision certification cannot be admitted.");
}
