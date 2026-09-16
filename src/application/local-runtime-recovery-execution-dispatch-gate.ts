import type { LocalRuntimeRecoveryDecisionExecution } from "./local-runtime-recovery-decision-execution.js";
import type { LocalRuntimeRecoveryDecisionExecutionEvidence } from "./local-runtime-recovery-decision-execution-evidence.js";
import type { LocalRuntimeRecoveryExecutionCertification } from "./local-runtime-recovery-execution-certification.js";
import { assertLocalRuntimeRecoveryExecutionCertification } from "./local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";

export type LocalRuntimeRecoveryExecutionDispatch = Readonly<{
  dispatchId: string;
  executionId: string;
  certificationId: string;
  evidenceId: string;
  decisionId: string;
  decisionFingerprint: string;
  dispatched: true;
  syntheticOnly: true;
}>;

export function dispatchLocalRuntimeRecoveryExecution(input: {
  dispatchId: string;
  certification: LocalRuntimeRecoveryExecutionCertification;
  execution: LocalRuntimeRecoveryDecisionExecution;
  evidence: LocalRuntimeRecoveryDecisionExecutionEvidence;
  decision: LocalRuntimeRecoveryDecision;
}): LocalRuntimeRecoveryExecutionDispatch {
  if (!input.dispatchId.trim()) throw new Error("Recovery execution dispatch identity is required.");
  assertLocalRuntimeRecoveryExecutionCertification(input.certification, input.execution, input.evidence, input.decision);
  if (input.certification.admitted !== true || input.certification.certified !== true) throw new Error("Only certified recovery execution may be dispatched.");
  if (input.certification.executionId !== input.execution.executionId || input.certification.evidenceId !== input.evidence.evidenceId || input.certification.decisionId !== input.decision.decisionId) throw new Error("Recovery execution dispatch identity drift.");
  if (input.certification.decisionFingerprint !== input.decision.decisionFingerprint || input.evidence.decisionFingerprint !== input.decision.decisionFingerprint) throw new Error("Recovery execution dispatch fingerprint drift.");
  return Object.freeze({ dispatchId: input.dispatchId, executionId: input.execution.executionId, certificationId: input.certification.certificationId, evidenceId: input.evidence.evidenceId, decisionId: input.decision.decisionId, decisionFingerprint: input.decision.decisionFingerprint, dispatched: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryExecutionDispatch(dispatch: LocalRuntimeRecoveryExecutionDispatch, certification: LocalRuntimeRecoveryExecutionCertification): void {
  if (!dispatch.dispatched || !dispatch.syntheticOnly) throw new Error("Recovery execution dispatch must be dispatched and synthetic-only.");
  if (dispatch.executionId !== certification.executionId || dispatch.certificationId !== certification.certificationId || dispatch.evidenceId !== certification.evidenceId || dispatch.decisionId !== certification.decisionId || dispatch.decisionFingerprint !== certification.decisionFingerprint) throw new Error("Recovery execution dispatch drift.");
}
