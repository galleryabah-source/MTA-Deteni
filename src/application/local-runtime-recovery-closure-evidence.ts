import type { LocalRuntimeRecoveryRuntimeContinuityReceipt } from "./local-runtime-recovery-runtime-continuity-receipt.js";
import { assertLocalRuntimeRecoveryRuntimeContinuityReceipt } from "./local-runtime-recovery-runtime-continuity-receipt.js";
import type { RuntimeContinuityClosure } from "./local-runtime-recovery-runtime-continuity-receipt-close.js";
import { assertLocalRuntimeRecoveryRuntimeContinuityClosure } from "./local-runtime-recovery-runtime-continuity-receipt-close.js";
import type { ContinuityCertification } from "./continuity-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "./local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "./local-runtime-recovery-execution-acknowledgement-certification.js";
import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "./integrated-local-runtime-recovery-execution-certification.js";

export type LocalRuntimeRecoveryClosureEvidence = Readonly<{
  evidenceId: string;
  continuityCertificationId: string;
  receiptId: string;
  closureId: string;
  executionId: string;
  dispatchId: string;
  acknowledgementId: string;
  decisionFingerprint: string;
  closureDisposition: "CLOSED";
  complete: true;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryClosureEvidence(input: {
  evidenceId: string;
  continuity: ContinuityCertification;
  integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification;
  completionProof: LocalRuntimeRecoveryExecutionCompletionProof;
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement;
  acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification;
  receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt;
  closure: RuntimeContinuityClosure;
}): LocalRuntimeRecoveryClosureEvidence {
  if (!input.evidenceId.trim()) throw new Error("Runtime recovery closure evidence identity is required.");
  assertLocalRuntimeRecoveryRuntimeContinuityReceipt(input.receipt, input.continuity, input.integratedCertification, input.completionProof, input.acknowledgement, input.acknowledgementCertification);
  assertLocalRuntimeRecoveryRuntimeContinuityClosure(input.closure, input.receipt);
  if (input.receipt.executionId !== input.integratedCertification.executionId || input.receipt.dispatchId !== input.integratedCertification.dispatchId || input.receipt.acknowledgementId !== input.acknowledgement.acknowledgementId || input.receipt.decisionFingerprint !== input.integratedCertification.decisionFingerprint) throw new Error("Runtime recovery closure evidence identity drift.");
  return Object.freeze({ evidenceId: input.evidenceId, continuityCertificationId: input.continuity.certificationId, receiptId: input.receipt.receiptId, closureId: input.closure.closureId, executionId: input.receipt.executionId, dispatchId: input.receipt.dispatchId, acknowledgementId: input.receipt.acknowledgementId, decisionFingerprint: input.receipt.decisionFingerprint, closureDisposition: "CLOSED", complete: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryClosureEvidence(input: {
  evidence: LocalRuntimeRecoveryClosureEvidence;
  continuity: ContinuityCertification;
  integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification;
  completionProof: LocalRuntimeRecoveryExecutionCompletionProof;
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement;
  acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification;
  receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt;
  closure: RuntimeContinuityClosure;
}): void {
  const { evidence, continuity, integratedCertification, completionProof, acknowledgement, acknowledgementCertification, receipt, closure } = input;
  if (!evidence.complete || evidence.closureDisposition !== "CLOSED" || !evidence.syntheticOnly) throw new Error("Runtime recovery closure evidence must be complete, closed and synthetic-only.");
  assertLocalRuntimeRecoveryRuntimeContinuityReceipt(receipt, continuity, integratedCertification, completionProof, acknowledgement, acknowledgementCertification);
  assertLocalRuntimeRecoveryRuntimeContinuityClosure(closure, receipt);
  if (evidence.continuityCertificationId !== continuity.certificationId || evidence.receiptId !== receipt.receiptId || evidence.closureId !== closure.closureId || evidence.executionId !== receipt.executionId || evidence.dispatchId !== receipt.dispatchId || evidence.acknowledgementId !== receipt.acknowledgementId || evidence.decisionFingerprint !== receipt.decisionFingerprint) throw new Error("Runtime recovery closure evidence drift.");
}
