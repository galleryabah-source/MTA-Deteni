import type { ContinuityCertification } from "./continuity-certification.js";
import { assertContinuityCertification } from "./continuity-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "./local-runtime-recovery-execution-completion-proof.js";
import { assertLocalRuntimeRecoveryExecutionCompletionProof } from "./local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "./local-runtime-recovery-execution-acknowledgement-certification.js";
import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "./integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";

export type LocalRuntimeRecoveryRuntimeContinuityReceipt = Readonly<{
  receiptId: string;
  continuityCertificationId: string;
  completionProofId: string;
  acknowledgementCertificationId: string;
  executionId: string;
  dispatchId: string;
  acknowledgementId: string;
  decisionFingerprint: string;
  continuityState: "READY";
  closed: true;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryRuntimeContinuityReceipt(input: {
  receiptId: string;
  continuity: ContinuityCertification;
  integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification;
  completionProof: LocalRuntimeRecoveryExecutionCompletionProof;
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement;
  acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification;
}): LocalRuntimeRecoveryRuntimeContinuityReceipt {
  if (!input.receiptId.trim()) throw new Error("Runtime continuity receipt identity is required.");
  assertContinuityCertification(input.continuity);
  assertLocalRuntimeRecoveryExecutionCompletionProof(input.completionProof, input.integratedCertification, input.acknowledgement, input.acknowledgementCertification);
  if (!input.integratedCertification.syntheticOnly || !input.acknowledgement.syntheticOnly) throw new Error("Runtime continuity receipt requires synthetic-only execution chain.");
  if (input.continuity.executionId !== input.completionProof.executionId) throw new Error("Runtime continuity receipt execution drift.");
  if (input.acknowledgementCertification.acknowledgementId !== input.completionProof.acknowledgementId || input.acknowledgementCertification.integratedCertificationId !== input.completionProof.certificationId || input.acknowledgementCertification.executionId !== input.completionProof.executionId || input.acknowledgementCertification.dispatchId !== input.completionProof.dispatchId || input.acknowledgementCertification.decisionFingerprint !== input.completionProof.decisionFingerprint) throw new Error("Runtime continuity receipt acknowledgement drift.");
  if (!input.acknowledgementCertification.certified || !input.acknowledgementCertification.admitted || !input.acknowledgementCertification.syntheticOnly) throw new Error("Runtime continuity receipt requires certified acknowledgement.");
  return Object.freeze({ receiptId: input.receiptId, continuityCertificationId: input.continuity.certificationId, completionProofId: input.completionProof.proofId, acknowledgementCertificationId: input.acknowledgementCertification.certificationId, executionId: input.completionProof.executionId, dispatchId: input.completionProof.dispatchId, acknowledgementId: input.completionProof.acknowledgementId, decisionFingerprint: input.completionProof.decisionFingerprint, continuityState: "READY", closed: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryRuntimeContinuityReceipt(receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt, continuity: ContinuityCertification, integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification, completionProof: LocalRuntimeRecoveryExecutionCompletionProof, acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement, acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification): void {
  if (!receipt.closed || receipt.continuityState !== "READY" || !receipt.syntheticOnly) throw new Error("Runtime continuity receipt must be closed, ready and synthetic-only.");
  assertContinuityCertification(continuity);
  assertLocalRuntimeRecoveryExecutionCompletionProof(completionProof, integratedCertification, acknowledgement, acknowledgementCertification);
  if (receipt.continuityCertificationId !== continuity.certificationId || receipt.completionProofId !== completionProof.proofId || receipt.acknowledgementCertificationId !== acknowledgementCertification.certificationId || receipt.executionId !== completionProof.executionId || receipt.dispatchId !== completionProof.dispatchId || receipt.acknowledgementId !== completionProof.acknowledgementId || receipt.decisionFingerprint !== completionProof.decisionFingerprint) throw new Error("Runtime continuity receipt drift.");
}
