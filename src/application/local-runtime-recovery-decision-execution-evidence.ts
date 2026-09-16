import type { LocalRuntimeRecoveryDecisionExecution } from "./local-runtime-recovery-decision-execution.js";
import { assertLocalRuntimeRecoveryDecisionExecution } from "./local-runtime-recovery-decision-execution.js";
import type { LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";
import type { LocalRuntimeRecoveryDecisionAuditEvidence } from "./local-runtime-recovery-decision-audit.js";

export type LocalRuntimeRecoveryDecisionExecutionEvidence = Readonly<{
  evidenceId: string;
  executionId: string;
  decisionId: string;
  requestId: string;
  certificationId: string;
  auditEvidenceId: string;
  envelopeId: string;
  decisionFingerprint: string;
  admitted: true;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryDecisionExecutionEvidence(input: { evidenceId: string; execution: LocalRuntimeRecoveryDecisionExecution; decision: LocalRuntimeRecoveryDecision; auditEvidence: LocalRuntimeRecoveryDecisionAuditEvidence }): LocalRuntimeRecoveryDecisionExecutionEvidence {
  if (!input.evidenceId.trim()) throw new Error("Recovery decision execution evidence identity is required.");
  assertLocalRuntimeRecoveryDecisionExecution(input.execution);
  if (input.execution.decisionId !== input.decision.decisionId || input.execution.requestId !== input.auditEvidence.decisionId.replace(/^DEC-/, "REQ-")) throw new Error("Recovery decision execution evidence identity drift.");
  if (input.execution.auditEvidenceId !== input.auditEvidence.auditEvidenceId || input.execution.envelopeId !== input.auditEvidence.envelopeId) throw new Error("Recovery decision execution evidence binding drift.");
  return Object.freeze({ evidenceId: input.evidenceId, executionId: input.execution.executionId, decisionId: input.execution.decisionId, requestId: input.execution.requestId, certificationId: input.execution.certificationId, auditEvidenceId: input.execution.auditEvidenceId, envelopeId: input.execution.envelopeId, decisionFingerprint: input.decision.decisionFingerprint, admitted: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryDecisionExecutionEvidence(evidence: LocalRuntimeRecoveryDecisionExecutionEvidence, execution: LocalRuntimeRecoveryDecisionExecution, decision: LocalRuntimeRecoveryDecision): void {
  if (!evidence.syntheticOnly || !evidence.admitted) throw new Error("Recovery decision execution evidence must be admitted and synthetic-only.");
  assertLocalRuntimeRecoveryDecisionExecution(execution);
  if (evidence.executionId !== execution.executionId || evidence.decisionId !== execution.decisionId || evidence.requestId !== execution.requestId || evidence.certificationId !== execution.certificationId || evidence.auditEvidenceId !== execution.auditEvidenceId || evidence.envelopeId !== execution.envelopeId || evidence.decisionFingerprint !== decision.decisionFingerprint) throw new Error("Recovery decision execution evidence drift.");
}
