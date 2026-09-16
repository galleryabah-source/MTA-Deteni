import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "./integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "./local-runtime-recovery-execution-acknowledgement-certification.js";

export type LocalRuntimeRecoveryExecutionCompletionProof = Readonly<{
  proofId: string;
  certificationId: string;
  acknowledgementCertificationId: string;
  executionId: string;
  dispatchId: string;
  acknowledgementId: string;
  decisionFingerprint: string;
  completed: true;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryExecutionCompletionProof(input: { proofId: string; integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification; acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement; acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification }): LocalRuntimeRecoveryExecutionCompletionProof {
  if (!input.proofId.trim()) throw new Error("Recovery execution completion proof identity is required.");
  if (!input.integratedCertification.certified || !input.integratedCertification.admitted || !input.integratedCertification.syntheticOnly) throw new Error("Integrated execution certification is not complete.");
  if (!input.acknowledgement.acknowledged || !input.acknowledgement.syntheticOnly) throw new Error("Execution acknowledgement is not complete.");
  if (!input.acknowledgementCertification.certified || !input.acknowledgementCertification.admitted || !input.acknowledgementCertification.syntheticOnly) throw new Error("Acknowledgement certification is not complete.");
  if (input.acknowledgementCertification.acknowledgementId !== input.acknowledgement.acknowledgementId || input.acknowledgementCertification.integratedCertificationId !== input.integratedCertification.certificationId || input.acknowledgementCertification.executionId !== input.integratedCertification.executionId || input.acknowledgementCertification.dispatchId !== input.integratedCertification.dispatchId || input.acknowledgementCertification.decisionFingerprint !== input.integratedCertification.decisionFingerprint) throw new Error("Recovery execution completion identity drift.");
  return Object.freeze({ proofId: input.proofId, certificationId: input.integratedCertification.certificationId, acknowledgementCertificationId: input.acknowledgementCertification.certificationId, executionId: input.integratedCertification.executionId, dispatchId: input.integratedCertification.dispatchId, acknowledgementId: input.acknowledgement.acknowledgementId, decisionFingerprint: input.integratedCertification.decisionFingerprint, completed: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryExecutionCompletionProof(proof: LocalRuntimeRecoveryExecutionCompletionProof, integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification, acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement, acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification): void {
  if (!proof.completed || !proof.syntheticOnly) throw new Error("Recovery execution completion proof must be complete and synthetic-only.");
  if (proof.certificationId !== integratedCertification.certificationId || proof.acknowledgementCertificationId !== acknowledgementCertification.certificationId || proof.executionId !== integratedCertification.executionId || proof.dispatchId !== integratedCertification.dispatchId || proof.acknowledgementId !== acknowledgement.acknowledgementId || proof.decisionFingerprint !== integratedCertification.decisionFingerprint) throw new Error("Recovery execution completion proof drift.");
}
