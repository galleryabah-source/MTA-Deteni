import { assertLocalRuntimeRecoveryDecisionIntegrity, type LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";
import type { LocalRuntimeSafetyCertificationEnvelope } from "./local-runtime-safety-certification.js";

export type LocalRuntimeRecoveryDecisionAuditEvidence = Readonly<{
  auditEvidenceId: string;
  decisionId: string;
  envelopeId: string;
  journeyId: string;
  certificationId: string;
  evidenceId: string;
  dispositionId: string;
  scenario: LocalRuntimeRecoveryDecision["scenario"];
  action: LocalRuntimeRecoveryDecision["action"];
  admitted: boolean;
  decisionFingerprint: string;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryDecisionAuditEvidence(input: { auditEvidenceId: string; decision: LocalRuntimeRecoveryDecision; envelope: LocalRuntimeSafetyCertificationEnvelope }): LocalRuntimeRecoveryDecisionAuditEvidence {
  if (!input.auditEvidenceId.trim()) throw new Error("Local runtime recovery decision audit identity is required.");
  assertLocalRuntimeRecoveryDecisionIntegrity(input.decision, input.envelope);
  return Object.freeze({ auditEvidenceId: input.auditEvidenceId, decisionId: input.decision.decisionId, envelopeId: input.decision.envelopeId, journeyId: input.decision.journeyId, certificationId: input.decision.certificationId, evidenceId: input.decision.evidenceId, dispositionId: input.decision.dispositionId, scenario: input.decision.scenario, action: input.decision.action, admitted: input.decision.admitted, decisionFingerprint: input.decision.decisionFingerprint, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryDecisionAuditEvidence(evidence: LocalRuntimeRecoveryDecisionAuditEvidence, decision: LocalRuntimeRecoveryDecision): void {
  if (!evidence.syntheticOnly) throw new Error("Local runtime recovery decision audit evidence must be synthetic-only.");
  if (!evidence.auditEvidenceId.trim()) throw new Error("Local runtime recovery decision audit identity is required.");
  if (evidence.decisionId !== decision.decisionId || evidence.envelopeId !== decision.envelopeId || evidence.journeyId !== decision.journeyId || evidence.certificationId !== decision.certificationId || evidence.evidenceId !== decision.evidenceId || evidence.dispositionId !== decision.dispositionId || evidence.scenario !== decision.scenario || evidence.action !== decision.action || evidence.admitted !== decision.admitted || evidence.decisionFingerprint !== decision.decisionFingerprint) throw new Error("Local runtime recovery decision audit drift.");
}
