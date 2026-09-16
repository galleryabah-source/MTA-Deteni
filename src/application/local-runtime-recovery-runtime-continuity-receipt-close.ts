import type { LocalRuntimeRecoveryRuntimeContinuityReceipt } from "./local-runtime-recovery-runtime-continuity-receipt.js";
import { assertLocalRuntimeRecoveryRuntimeContinuityReceipt } from "./local-runtime-recovery-runtime-continuity-receipt.js";
import type { ContinuityCertification } from "./continuity-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "./local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "./local-runtime-recovery-execution-acknowledgement-certification.js";

export type RuntimeContinuityClosureDisposition = "CLOSED" | "REPLAY" | "CONFLICT";

export type RuntimeContinuityClosure = Readonly<{
  closureId: string;
  receiptId: string;
  disposition: RuntimeContinuityClosureDisposition;
  closed: boolean;
  syntheticOnly: true;
}>;

export function closeLocalRuntimeRecoveryRuntimeContinuity(input: {
  closureId: string;
  receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt;
  continuity: ContinuityCertification;
  completionProof: LocalRuntimeRecoveryExecutionCompletionProof;
  acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification;
  unresolvedAcknowledgementConflict?: boolean;
}): RuntimeContinuityClosure {
  if (!input.closureId.trim()) throw new Error("Runtime continuity closure identity is required.");
  assertLocalRuntimeRecoveryRuntimeContinuityReceipt(input.receipt, input.continuity, input.completionProof, input.acknowledgementCertification);
  if (input.unresolvedAcknowledgementConflict === true) throw new Error("Unresolved acknowledgement conflict blocks runtime continuity closure.");
  return Object.freeze({ closureId: input.closureId, receiptId: input.receipt.receiptId, disposition: "CLOSED", closed: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryRuntimeContinuityClosure(input: RuntimeContinuityClosure, receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt): void {
  if (!input.closed || input.disposition !== "CLOSED" || !input.syntheticOnly) throw new Error("Runtime continuity closure must be closed and synthetic-only.");
  if (input.receiptId !== receipt.receiptId) throw new Error("Runtime continuity closure receipt drift.");
}
