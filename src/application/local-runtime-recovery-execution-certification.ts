import type { LocalRuntimeRecoveryDecisionExecution } from "./local-runtime-recovery-decision-execution.js";
import { assertLocalRuntimeRecoveryDecisionExecution } from "./local-runtime-recovery-decision-execution.js";
import type { LocalRuntimeRecoveryDecisionExecutionEvidence } from "./local-runtime-recovery-decision-execution-evidence.js";
import { assertLocalRuntimeRecoveryDecisionExecutionEvidence } from "./local-runtime-recovery-decision-execution-evidence.js";
import type { LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";
import type { LocalRuntimeRecoveryDecisionCertification } from "./local-runtime-recovery-decision-certification.js";
import type { LocalRuntimeRecoveryDecisionAuditEvidence } from "./local-runtime-recovery-decision-audit.js";
import type { LocalRuntimeRequest } from "./local-runtime-adapter.js";

export type LocalRuntimeRecoveryExecutionCertification = Readonly<{
  certificationId: string;
  executionId: string;
  evidenceId: string;
  decisionId: string;
  requestId: string;
  decisionFingerprint: string;
  admitted: true;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeRecoveryExecution(input: {
  certificationId: string;
  execution: LocalRuntimeRecoveryDecisionExecution;
  executionEvidence: LocalRuntimeRecoveryDecisionExecutionEvidence;
  decision: LocalRuntimeRecoveryDecision;
  decisionCertification: LocalRuntimeRecoveryDecisionCertification;
  auditEvidence: LocalRuntimeRecoveryDecisionAuditEvidence;
  request: LocalRuntimeRequest;
}): LocalRuntimeRecoveryExecutionCertification {
  if (!input.certificationId.trim()) throw new Error("Recovery execution certification identity is required.");
  assertLocalRuntimeRecoveryDecisionExecution(input.execution);
  assertLocalRuntimeRecoveryDecisionExecutionEvidence(input.executionEvidence, input.execution, input.decision);
  if (!input.decisionCertification.admitted || !input.decisionCertification.certified || !input.decisionCertification.syntheticOnly) throw new Error("Recovery execution certification requires an admitted decision certification.");
  if (input.execution.decisionId !== input.decisionCertification.decisionId || input.execution.auditEvidenceId !== input.auditEvidence.auditEvidenceId || input.executionEvidence.auditEvidenceId !== input.auditEvidence.auditEvidenceId) throw new Error("Recovery execution certification identity drift.");
  if (input.execution.requestId !== input.request.requestId || input.executionEvidence.requestId !== input.request.requestId) throw new Error("Recovery execution certification request identity drift.");
  if (input.executionEvidence.decisionFingerprint !== input.decision.decisionFingerprint || input.auditEvidence.decisionFingerprint !== input.decision.decisionFingerprint) throw new Error("Recovery execution certification fingerprint drift.");
  return Object.freeze({ certificationId: input.certificationId, executionId: input.execution.executionId, evidenceId: input.executionEvidence.evidenceId, decisionId: input.execution.decisionId, requestId: input.execution.requestId, decisionFingerprint: input.decision.decisionFingerprint, admitted: true, certified: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryExecutionCertification(certification: LocalRuntimeRecoveryExecutionCertification, execution: LocalRuntimeRecoveryDecisionExecution, evidence: LocalRuntimeRecoveryDecisionExecutionEvidence, decision: LocalRuntimeRecoveryDecision): void {
  if (!certification.admitted || !certification.certified || !certification.syntheticOnly) throw new Error("Recovery execution certification must be admitted, certified and synthetic-only.");
  assertLocalRuntimeRecoveryDecisionExecution(execution);
  assertLocalRuntimeRecoveryDecisionExecutionEvidence(evidence, execution, decision);
  if (certification.executionId !== execution.executionId || certification.evidenceId !== evidence.evidenceId || certification.decisionId !== decision.decisionId || certification.requestId !== execution.requestId || certification.decisionFingerprint !== decision.decisionFingerprint) throw new Error("Recovery execution certification drift.");
}
