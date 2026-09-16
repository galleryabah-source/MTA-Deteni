import type { ContinuityCertification } from "./continuity-certification.js";
import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "./integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "./local-runtime-recovery-execution-acknowledgement-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "./local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryRuntimeContinuityReceipt } from "./local-runtime-recovery-runtime-continuity-receipt.js";
import type { RuntimeContinuityClosure } from "./local-runtime-recovery-runtime-continuity-receipt-close.js";
import type { LocalRuntimeRecoveryClosureEvidence } from "./local-runtime-recovery-closure-evidence.js";
import type { LocalRuntimeRecoveryClosureCertification } from "./local-runtime-recovery-closure-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditRecord } from "./local-runtime-recovery-final-closure-audit-record.js";
import { assertLocalRuntimeRecoveryFinalClosureAuditRecord } from "./local-runtime-recovery-final-closure-audit-record.js";
import { replayLocalRuntimeRecoveryFinalClosureAuditRecord, type FinalClosureAuditReplayDisposition } from "./local-runtime-recovery-final-closure-audit-replay.js";

export type LocalRuntimeRecoveryFinalClosureAuditCertification = Readonly<{
  certificationId: string;
  auditRecordId: string;
  closureCertificationId: string;
  evidenceId: string;
  continuityCertificationId: string;
  receiptId: string;
  closureId: string;
  executionId: string;
  dispatchId: string;
  acknowledgementId: string;
  decisionFingerprint: string;
  replayDisposition: "ADMIT" | "REPLAY";
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeRecoveryFinalClosureAudit(input: {
  certificationId: string;
  record: LocalRuntimeRecoveryFinalClosureAuditRecord;
  closureCertification: LocalRuntimeRecoveryClosureCertification;
  evidence: LocalRuntimeRecoveryClosureEvidence;
  continuity: ContinuityCertification;
  integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification;
  completionProof: LocalRuntimeRecoveryExecutionCompletionProof;
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement;
  acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification;
  receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt;
  closure: RuntimeContinuityClosure;
}): LocalRuntimeRecoveryFinalClosureAuditCertification {
  if (!input.certificationId.trim()) throw new Error("Final closure audit certification identity is required.");
  assertLocalRuntimeRecoveryFinalClosureAuditRecord({ record: input.record, certification: input.closureCertification, evidence: input.evidence });
  const replayDisposition = replayLocalRuntimeRecoveryFinalClosureAuditRecord({ record: input.record, certification: input.closureCertification, evidence: input.evidence, continuity: input.continuity, integratedCertification: input.integratedCertification, completionProof: input.completionProof, acknowledgement: input.acknowledgement, acknowledgementCertification: input.acknowledgementCertification, receipt: input.receipt, closure: input.closure });
  if (replayDisposition === "CONFLICT") throw new Error("Final closure audit certification conflict.");
  return Object.freeze({ certificationId: input.certificationId, auditRecordId: input.record.auditRecordId, closureCertificationId: input.closureCertification.certificationId, evidenceId: input.record.evidenceId, continuityCertificationId: input.record.continuityCertificationId, receiptId: input.record.receiptId, closureId: input.record.closureId, executionId: input.record.executionId, dispatchId: input.record.dispatchId, acknowledgementId: input.record.acknowledgementId, decisionFingerprint: input.record.decisionFingerprint, replayDisposition, certified: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryFinalClosureAuditCertification(input: LocalRuntimeRecoveryFinalClosureAuditCertification, record: LocalRuntimeRecoveryFinalClosureAuditRecord): void {
  if (!input.certified || !input.syntheticOnly || input.replayDisposition === "CONFLICT") throw new Error("Final closure audit certification must be certified, non-conflicted and synthetic-only.");
  if (input.auditRecordId !== record.auditRecordId || input.closureCertificationId !== record.certificationId || input.evidenceId !== record.evidenceId || input.continuityCertificationId !== record.continuityCertificationId || input.receiptId !== record.receiptId || input.closureId !== record.closureId || input.executionId !== record.executionId || input.dispatchId !== record.dispatchId || input.acknowledgementId !== record.acknowledgementId || input.decisionFingerprint !== record.decisionFingerprint) throw new Error("Final closure audit certification drift.");
}

export type { FinalClosureAuditReplayDisposition };
