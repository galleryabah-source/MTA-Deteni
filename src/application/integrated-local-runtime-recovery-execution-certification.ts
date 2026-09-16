import type { LocalRuntimeRecoveryExecutionCertification } from "./local-runtime-recovery-execution-certification.js";
import { assertLocalRuntimeRecoveryExecutionCertification } from "./local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryExecutionDispatch } from "./local-runtime-recovery-execution-dispatch-gate.js";
import { assertLocalRuntimeRecoveryExecutionDispatch } from "./local-runtime-recovery-execution-dispatch-gate.js";
import type { LocalRuntimeRecoveryDecisionExecution } from "./local-runtime-recovery-decision-execution.js";
import type { LocalRuntimeRecoveryDecisionExecutionEvidence } from "./local-runtime-recovery-decision-execution-evidence.js";
import type { LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";

export type IntegratedLocalRuntimeRecoveryExecutionCertification = Readonly<{
  certificationId: string;
  executionId: string;
  dispatchId: string;
  executionCertificationId: string;
  evidenceId: string;
  decisionId: string;
  requestId: string;
  decisionFingerprint: string;
  dispatched: true;
  admitted: true;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyIntegratedLocalRuntimeRecoveryExecution(input: {
  certificationId: string;
  execution: LocalRuntimeRecoveryDecisionExecution;
  evidence: LocalRuntimeRecoveryDecisionExecutionEvidence;
  decision: LocalRuntimeRecoveryDecision;
  executionCertification: LocalRuntimeRecoveryExecutionCertification;
  dispatch: LocalRuntimeRecoveryExecutionDispatch;
}): IntegratedLocalRuntimeRecoveryExecutionCertification {
  if (!input.certificationId.trim()) throw new Error("Integrated recovery execution certification identity is required.");
  assertLocalRuntimeRecoveryExecutionCertification(input.executionCertification, input.execution, input.evidence, input.decision);
  assertLocalRuntimeRecoveryExecutionDispatch(input.dispatch, input.executionCertification);
  if (input.dispatch.dispatched !== true || !input.executionCertification.admitted || !input.executionCertification.certified) throw new Error("Integrated recovery execution requires certified dispatched execution.");
  if (input.dispatch.executionId !== input.execution.executionId || input.dispatch.certificationId !== input.executionCertification.certificationId || input.dispatch.evidenceId !== input.evidence.evidenceId || input.dispatch.decisionId !== input.decision.decisionId) throw new Error("Integrated recovery execution identity drift.");
  if (input.dispatch.decisionFingerprint !== input.decision.decisionFingerprint || input.executionCertification.decisionFingerprint !== input.decision.decisionFingerprint) throw new Error("Integrated recovery execution fingerprint drift.");
  return Object.freeze({ certificationId: input.certificationId, executionId: input.execution.executionId, dispatchId: input.dispatch.dispatchId, executionCertificationId: input.executionCertification.certificationId, evidenceId: input.evidence.evidenceId, decisionId: input.decision.decisionId, requestId: input.execution.requestId, decisionFingerprint: input.decision.decisionFingerprint, dispatched: true, admitted: true, certified: true, syntheticOnly: true });
}

export function assertIntegratedLocalRuntimeRecoveryExecutionCertification(certification: IntegratedLocalRuntimeRecoveryExecutionCertification, executionCertification: LocalRuntimeRecoveryExecutionCertification, dispatch: LocalRuntimeRecoveryExecutionDispatch, execution: LocalRuntimeRecoveryDecisionExecution, evidence: LocalRuntimeRecoveryDecisionExecutionEvidence, decision: LocalRuntimeRecoveryDecision): void {
  if (!certification.dispatched || !certification.admitted || !certification.certified || !certification.syntheticOnly) throw new Error("Integrated recovery execution certification must be dispatched, admitted, certified and synthetic-only.");
  assertLocalRuntimeRecoveryExecutionCertification(executionCertification, execution, evidence, decision);
  assertLocalRuntimeRecoveryExecutionDispatch(dispatch, executionCertification);
  if (certification.executionId !== execution.executionId || certification.dispatchId !== dispatch.dispatchId || certification.executionCertificationId !== executionCertification.certificationId || certification.evidenceId !== evidence.evidenceId || certification.decisionId !== decision.decisionId || certification.requestId !== execution.requestId || certification.decisionFingerprint !== decision.decisionFingerprint) throw new Error("Integrated recovery execution certification drift.");
}
