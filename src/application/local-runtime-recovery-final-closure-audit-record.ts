import type { ContinuityCertification } from "./continuity-certification.js";
import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "./integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "./local-runtime-recovery-execution-acknowledgement-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "./local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryRuntimeContinuityReceipt } from "./local-runtime-recovery-runtime-continuity-receipt.js";
import type { RuntimeContinuityClosure } from "./local-runtime-recovery-runtime-continuity-receipt-close.js";
import type { LocalRuntimeRecoveryClosureEvidence } from "./local-runtime-recovery-closure-evidence.js";
import type { LocalRuntimeRecoveryClosureCertification } from "./local-runtime-recovery-closure-certification.js";
import { assertLocalRuntimeRecoveryClosureCertification } from "./local-runtime-recovery-closure-certification.js";

export type LocalRuntimeRecoveryFinalClosureAuditRecord = Readonly<{
  auditRecordId: string;
  certificationId: string;
  evidenceId: string;
  continuityCertificationId: string;
  receiptId: string;
  closureId: string;
  executionId: string;
  dispatchId: string;
  acknowledgementId: string;
  decisionFingerprint: string;
  auditState: "CLOSED";
  complete: true;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryFinalClosureAuditRecord(input: {
  auditRecordId: string;
  certification: LocalRuntimeRecoveryClosureCertification;
  evidence: LocalRuntimeRecoveryClosureEvidence;
  continuity: ContinuityCertification;
  integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification;
  completionProof: LocalRuntimeRecoveryExecutionCompletionProof;
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement;
  acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification;
  receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt;
  closure: RuntimeContinuityClosure;
}): LocalRuntimeRecoveryFinalClosureAuditRecord {
  if (!input.auditRecordId.trim()) throw new Error("Final closure audit record identity is required.");
  assertLocalRuntimeRecoveryClosureCertification(input.certification, input.evidence);
  return Object.freeze({ auditRecordId: input.auditRecordId, certificationId: input.certification.certificationId, evidenceId: input.evidence.evidenceId, continuityCertificationId: input.continuity.certificationId, receiptId: input.receipt.receiptId, closureId: input.closure.closureId, executionId: input.receipt.executionId, dispatchId: input.receipt.dispatchId, acknowledgementId: input.receipt.acknowledgementId, decisionFingerprint: input.receipt.decisionFingerprint, auditState: "CLOSED", complete: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryFinalClosureAuditRecord(input: { record: LocalRuntimeRecoveryFinalClosureAuditRecord; certification: LocalRuntimeRecoveryClosureCertification; evidence: LocalRuntimeRecoveryClosureEvidence }): void {
  if (!input.record.complete || !input.record.syntheticOnly || input.record.auditState !== "CLOSED") throw new Error("Final closure audit record must be complete, closed and synthetic-only.");
  assertLocalRuntimeRecoveryClosureCertification(input.certification, input.evidence);
  if (input.record.certificationId !== input.certification.certificationId || input.record.evidenceId !== input.evidence.evidenceId || input.record.continuityCertificationId !== input.evidence.continuityCertificationId || input.record.receiptId !== input.evidence.receiptId || input.record.closureId !== input.evidence.closureId || input.record.executionId !== input.evidence.executionId || input.record.dispatchId !== input.evidence.dispatchId || input.record.acknowledgementId !== input.evidence.acknowledgementId || input.record.decisionFingerprint !== input.evidence.decisionFingerprint) throw new Error("Final closure audit record identity drift.");
}
