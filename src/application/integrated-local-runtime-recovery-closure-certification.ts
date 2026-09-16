import type { LocalRuntimeRecoveryRuntimeContinuityReceipt } from "./local-runtime-recovery-runtime-continuity-receipt.js";
import { assertLocalRuntimeRecoveryRuntimeContinuityReceipt } from "./local-runtime-recovery-runtime-continuity-receipt.js";
import type { RuntimeContinuityClosure } from "./local-runtime-recovery-runtime-continuity-receipt-close.js";
import { assertLocalRuntimeRecoveryRuntimeContinuityClosure } from "./local-runtime-recovery-runtime-continuity-receipt-close.js";
import type { ContinuityCertification } from "./continuity-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "./local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "./local-runtime-recovery-execution-acknowledgement-certification.js";

export type IntegratedLocalRuntimeRecoveryClosureCertification = Readonly<{
  certificationId: string;
  continuityCertificationId: string;
  receiptId: string;
  closureId: string;
  completionProofId: string;
  acknowledgementCertificationId: string;
  executionId: string;
  dispatchId: string;
  acknowledgementId: string;
  decisionFingerprint: string;
  closed: true;
  certified: true;
  admitted: true;
  syntheticOnly: true;
}>;

export function certifyIntegratedLocalRuntimeRecoveryClosure(input: {
  certificationId: string;
  continuity: ContinuityCertification;
  receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt;
  closure: RuntimeContinuityClosure;
  completionProof: LocalRuntimeRecoveryExecutionCompletionProof;
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement;
  acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification;
}): IntegratedLocalRuntimeRecoveryClosureCertification {
  if (!input.certificationId.trim()) throw new Error("Integrated recovery closure certification identity is required.");
  assertLocalRuntimeRecoveryRuntimeContinuityReceipt(input.receipt, input.continuity, input.completionProof, input.acknowledgementCertification);
  assertLocalRuntimeRecoveryRuntimeContinuityClosure(input.closure, input.receipt);
  if (input.closure.disposition !== "CLOSED") throw new Error("Only CLOSED runtime continuity may be certified.");
  if (!input.acknowledgement.syntheticOnly || !input.completionProof.syntheticOnly) throw new Error("Integrated recovery closure must be synthetic-only.");
  if (input.receipt.completionProofId !== input.completionProof.proofId || input.receipt.acknowledgementId !== input.acknowledgement.acknowledgementId || input.receipt.acknowledgementCertificationId !== input.acknowledgementCertification.certificationId) throw new Error("Integrated recovery closure identity drift.");
  if (input.receipt.executionId !== input.completionProof.executionId || input.receipt.dispatchId !== input.completionProof.dispatchId || input.receipt.decisionFingerprint !== input.completionProof.decisionFingerprint) throw new Error("Integrated recovery closure execution drift.");
  return Object.freeze({ certificationId: input.certificationId, continuityCertificationId: input.continuity.certificationId, receiptId: input.receipt.receiptId, closureId: input.closure.closureId, completionProofId: input.completionProof.proofId, acknowledgementCertificationId: input.acknowledgementCertification.certificationId, executionId: input.completionProof.executionId, dispatchId: input.completionProof.dispatchId, acknowledgementId: input.completionProof.acknowledgementId, decisionFingerprint: input.completionProof.decisionFingerprint, closed: true, certified: true, admitted: true, syntheticOnly: true });
}

export function assertIntegratedLocalRuntimeRecoveryClosureCertification(certification: IntegratedLocalRuntimeRecoveryClosureCertification, continuity: ContinuityCertification, receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt, closure: RuntimeContinuityClosure, completionProof: LocalRuntimeRecoveryExecutionCompletionProof, acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement, acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification): void {
  if (!certification.closed || !certification.certified || !certification.admitted || !certification.syntheticOnly) throw new Error("Integrated recovery closure certification must be closed, certified, admitted and synthetic-only.");
  assertLocalRuntimeRecoveryRuntimeContinuityReceipt(receipt, continuity, completionProof, acknowledgementCertification);
  assertLocalRuntimeRecoveryRuntimeContinuityClosure(closure, receipt);
  if (certification.certificationId.trim() === "" || certification.continuityCertificationId !== continuity.certificationId || certification.receiptId !== receipt.receiptId || certification.closureId !== closure.closureId || certification.completionProofId !== completionProof.proofId || certification.acknowledgementCertificationId !== acknowledgementCertification.certificationId || certification.executionId !== completionProof.executionId || certification.dispatchId !== completionProof.dispatchId || certification.acknowledgementId !== acknowledgement.acknowledgementId || certification.decisionFingerprint !== completionProof.decisionFingerprint) throw new Error("Integrated recovery closure certification drift.");
}
