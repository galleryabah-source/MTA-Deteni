import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "./integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementReplayResult } from "./local-runtime-recovery-execution-acknowledgement-replay.js";

export type LocalRuntimeRecoveryExecutionAcknowledgementCertification = Readonly<{
  certificationId: string;
  acknowledgementId: string;
  integratedCertificationId: string;
  executionId: string;
  dispatchId: string;
  decisionFingerprint: string;
  disposition: "ADMIT" | "REPLAY";
  admitted: true;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeRecoveryExecutionAcknowledgement(input: { certificationId: string; acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement; integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification; replay: LocalRuntimeRecoveryExecutionAcknowledgementReplayResult }): LocalRuntimeRecoveryExecutionAcknowledgementCertification {
  if (!input.certificationId.trim()) throw new Error("Acknowledgement certification identity is required.");
  if (!input.acknowledgement.acknowledged || !input.acknowledgement.syntheticOnly) throw new Error("Only acknowledged synthetic execution may be certified.");
  if (!input.integratedCertification.certified || !input.integratedCertification.admitted || !input.integratedCertification.syntheticOnly) throw new Error("Integrated execution certification is not admissible.");
  if (input.replay.disposition === "CONFLICT") throw new Error("Conflicted acknowledgement cannot be certified.");
  if (input.replay.acknowledgementId !== input.acknowledgement.acknowledgementId || input.replay.fingerprint !== input.acknowledgement.decisionFingerprint) throw new Error("Acknowledgement replay identity drift.");
  if (input.acknowledgement.certificationId !== input.integratedCertification.certificationId || input.acknowledgement.executionId !== input.integratedCertification.executionId || input.acknowledgement.dispatchId !== input.integratedCertification.dispatchId || input.acknowledgement.decisionFingerprint !== input.integratedCertification.decisionFingerprint) throw new Error("Acknowledgement certification binding drift.");
  return Object.freeze({ certificationId: input.certificationId, acknowledgementId: input.acknowledgement.acknowledgementId, integratedCertificationId: input.integratedCertification.certificationId, executionId: input.acknowledgement.executionId, dispatchId: input.acknowledgement.dispatchId, decisionFingerprint: input.acknowledgement.decisionFingerprint, disposition: input.replay.disposition, admitted: true, certified: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryExecutionAcknowledgementCertification(certification: LocalRuntimeRecoveryExecutionAcknowledgementCertification, acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement, integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification): void {
  if (!certification.certified || !certification.admitted || !certification.syntheticOnly) throw new Error("Acknowledgement certification must be certified, admitted and synthetic-only.");
  if (certification.acknowledgementId !== acknowledgement.acknowledgementId || certification.integratedCertificationId !== integratedCertification.certificationId || certification.executionId !== acknowledgement.executionId || certification.dispatchId !== acknowledgement.dispatchId || certification.decisionFingerprint !== acknowledgement.decisionFingerprint) throw new Error("Acknowledgement certification drift.");
}
