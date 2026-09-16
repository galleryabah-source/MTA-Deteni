import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "./integrated-local-runtime-recovery-execution-certification.js";
import { assertIntegratedLocalRuntimeRecoveryExecutionCertification } from "./integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryDecisionExecution } from "./local-runtime-recovery-decision-execution.js";
import type { LocalRuntimeRecoveryDecisionExecutionEvidence } from "./local-runtime-recovery-decision-execution-evidence.js";
import type { LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";

export type LocalRuntimeRecoveryExecutionAcknowledgement = Readonly<{
  acknowledgementId: string;
  certificationId: string;
  executionId: string;
  dispatchId: string;
  evidenceId: string;
  decisionId: string;
  requestId: string;
  decisionFingerprint: string;
  acknowledged: true;
  syntheticOnly: true;
}>;

export function acknowledgeLocalRuntimeRecoveryExecution(input: {
  acknowledgementId: string;
  integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification;
  execution: LocalRuntimeRecoveryDecisionExecution;
  evidence: LocalRuntimeRecoveryDecisionExecutionEvidence;
  decision: LocalRuntimeRecoveryDecision;
}): LocalRuntimeRecoveryExecutionAcknowledgement {
  if (!input.acknowledgementId.trim()) throw new Error("Recovery execution acknowledgement identity is required.");
  assertIntegratedLocalRuntimeRecoveryExecutionCertification(input.integratedCertification, input.integratedCertification.executionCertificationId === input.integratedCertification.executionCertificationId ? {
    executionId: input.execution.executionId,
    evidenceId: input.evidence.evidenceId,
    decisionId: input.decision.decisionId,
    requestId: input.execution.requestId,
    decisionFingerprint: input.decision.decisionFingerprint,
    certificationId: input.integratedCertification.executionCertificationId,
    admitted: true,
    certified: true,
    syntheticOnly: true,
  } : (null as never), input.integratedCertification.dispatchId ? {
    dispatchId: input.integratedCertification.dispatchId,
    executionId: input.execution.executionId,
    certificationId: input.integratedCertification.executionCertificationId,
    evidenceId: input.evidence.evidenceId,
    decisionId: input.decision.decisionId,
    decisionFingerprint: input.decision.decisionFingerprint,
    dispatched: true,
    syntheticOnly: true,
  } : (null as never), input.execution, input.evidence, input.decision);
  if (input.integratedCertification.executionId !== input.execution.executionId || input.integratedCertification.evidenceId !== input.evidence.evidenceId || input.integratedCertification.decisionId !== input.decision.decisionId || input.integratedCertification.requestId !== input.execution.requestId) throw new Error("Recovery execution acknowledgement identity drift.");
  if (input.integratedCertification.decisionFingerprint !== input.decision.decisionFingerprint) throw new Error("Recovery execution acknowledgement fingerprint drift.");
  return Object.freeze({
    acknowledgementId: input.acknowledgementId,
    certificationId: input.integratedCertification.certificationId,
    executionId: input.execution.executionId,
    dispatchId: input.integratedCertification.dispatchId,
    evidenceId: input.evidence.evidenceId,
    decisionId: input.decision.decisionId,
    requestId: input.execution.requestId,
    decisionFingerprint: input.decision.decisionFingerprint,
    acknowledged: true,
    syntheticOnly: true,
  });
}

export function assertLocalRuntimeRecoveryExecutionAcknowledgement(
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement,
  integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification,
  execution: LocalRuntimeRecoveryDecisionExecution,
  evidence: LocalRuntimeRecoveryDecisionExecutionEvidence,
  decision: LocalRuntimeRecoveryDecision,
): void {
  if (!acknowledgement.acknowledged || !acknowledgement.syntheticOnly) throw new Error("Recovery execution acknowledgement must be acknowledged and synthetic-only.");
  assertIntegratedLocalRuntimeRecoveryExecutionCertification(integratedCertification, {
    executionId: execution.executionId,
    evidenceId: evidence.evidenceId,
    decisionId: decision.decisionId,
    requestId: execution.requestId,
    decisionFingerprint: decision.decisionFingerprint,
    certificationId: integratedCertification.executionCertificationId,
    admitted: true,
    certified: true,
    syntheticOnly: true,
  }, {
    dispatchId: integratedCertification.dispatchId,
    executionId: execution.executionId,
    certificationId: integratedCertification.executionCertificationId,
    evidenceId: evidence.evidenceId,
    decisionId: decision.decisionId,
    decisionFingerprint: decision.decisionFingerprint,
    dispatched: true,
    syntheticOnly: true,
  }, execution, evidence, decision);
  if (acknowledgement.certificationId !== integratedCertification.certificationId || acknowledgement.executionId !== execution.executionId || acknowledgement.dispatchId !== integratedCertification.dispatchId || acknowledgement.evidenceId !== evidence.evidenceId || acknowledgement.decisionId !== decision.decisionId || acknowledgement.requestId !== execution.requestId || acknowledgement.decisionFingerprint !== decision.decisionFingerprint) throw new Error("Recovery execution acknowledgement drift.");
}
