import type { LocalRuntimeRecoveryClosureEvidence } from "./local-runtime-recovery-closure-evidence.js";
import { assertLocalRuntimeRecoveryClosureEvidence } from "./local-runtime-recovery-closure-evidence.js";
import type { ContinuityCertification } from "./continuity-certification.js";
import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "./integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "./local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "./local-runtime-recovery-execution-acknowledgement-certification.js";
import type { LocalRuntimeRecoveryRuntimeContinuityReceipt } from "./local-runtime-recovery-runtime-continuity-receipt.js";
import type { RuntimeContinuityClosure } from "./local-runtime-recovery-runtime-continuity-receipt-close.js";

export type LocalRuntimeRecoveryClosureCertification = Readonly<{
  certificationId: string;
  evidenceId: string;
  continuityCertificationId: string;
  receiptId: string;
  closureId: string;
  executionId: string;
  dispatchId: string;
  acknowledgementId: string;
  decisionFingerprint: string;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeRecoveryClosure(input: {
  certificationId: string;
  evidence: LocalRuntimeRecoveryClosureEvidence;
  continuity: ContinuityCertification;
  integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification;
  completionProof: LocalRuntimeRecoveryExecutionCompletionProof;
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement;
  acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification;
  receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt;
  closure: RuntimeContinuityClosure;
}): LocalRuntimeRecoveryClosureCertification {
  if (!input.certificationId.trim()) throw new Error("Runtime recovery closure certification identity is required.");
  assertLocalRuntimeRecoveryClosureEvidence(input);
  return Object.freeze({ certificationId: input.certificationId, evidenceId: input.evidence.evidenceId, continuityCertificationId: input.continuity.certificationId, receiptId: input.receipt.receiptId, closureId: input.closure.closureId, executionId: input.receipt.executionId, dispatchId: input.receipt.dispatchId, acknowledgementId: input.receipt.acknowledgementId, decisionFingerprint: input.receipt.decisionFingerprint, certified: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryClosureCertification(input: LocalRuntimeRecoveryClosureCertification, evidence: LocalRuntimeRecoveryClosureEvidence): void {
  if (!input.certified || !input.syntheticOnly) throw new Error("Runtime recovery closure certification must be certified and synthetic-only.");
  if (input.evidenceId !== evidence.evidenceId || input.continuityCertificationId !== evidence.continuityCertificationId || input.receiptId !== evidence.receiptId || input.closureId !== evidence.closureId || input.executionId !== evidence.executionId || input.dispatchId !== evidence.dispatchId || input.acknowledgementId !== evidence.acknowledgementId || input.decisionFingerprint !== evidence.decisionFingerprint) throw new Error("Runtime recovery closure certification drift.");
}
