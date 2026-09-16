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

export type FinalClosureAuditReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryFinalClosureAuditRecord(input: {
  record: LocalRuntimeRecoveryFinalClosureAuditRecord;
  certification: LocalRuntimeRecoveryClosureCertification;
  evidence: LocalRuntimeRecoveryClosureEvidence;
  continuity: ContinuityCertification;
  integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification;
  completionProof: LocalRuntimeRecoveryExecutionCompletionProof;
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement;
  acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification;
  receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt;
  closure: RuntimeContinuityClosure;
}): FinalClosureAuditReplayDisposition {
  assertLocalRuntimeRecoveryFinalClosureAuditRecord({ record: input.record, certification: input.certification, evidence: input.evidence });
  const key = `${input.record.auditRecordId}:${input.record.certificationId}`;
  const existing = registry.get(key);
  if (existing === undefined) {
    registry.set(key, input.record.decisionFingerprint);
    return "ADMIT";
  }
  return existing === input.record.decisionFingerprint ? "REPLAY" : "CONFLICT";
}

export function clearLocalRuntimeRecoveryFinalClosureAuditReplayRegistry(): void {
  registry.clear();
}
