import type { LocalRuntimeRecoveryClosureEvidence } from "./local-runtime-recovery-closure-evidence.js";
import { assertLocalRuntimeRecoveryClosureEvidence } from "./local-runtime-recovery-closure-evidence.js";
import type { ContinuityCertification } from "./continuity-certification.js";
import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "./integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "./local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "./local-runtime-recovery-execution-acknowledgement-certification.js";
import type { LocalRuntimeRecoveryRuntimeContinuityReceipt } from "./local-runtime-recovery-runtime-continuity-receipt.js";
import type { RuntimeContinuityClosure } from "./local-runtime-recovery-runtime-continuity-receipt-close.js";

export type ClosureEvidenceReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryClosureEvidence(input: {
  evidence: LocalRuntimeRecoveryClosureEvidence;
  continuity: ContinuityCertification;
  integratedCertification: IntegratedLocalRuntimeRecoveryExecutionCertification;
  completionProof: LocalRuntimeRecoveryExecutionCompletionProof;
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement;
  acknowledgementCertification: LocalRuntimeRecoveryExecutionAcknowledgementCertification;
  receipt: LocalRuntimeRecoveryRuntimeContinuityReceipt;
  closure: RuntimeContinuityClosure;
}): ClosureEvidenceReplayDisposition {
  assertLocalRuntimeRecoveryClosureEvidence(input);
  const key = `${input.evidence.evidenceId}:${input.evidence.closureId}`;
  const existing = registry.get(key);
  if (existing === undefined) { registry.set(key, input.evidence.decisionFingerprint); return "ADMIT"; }
  return existing === input.evidence.decisionFingerprint ? "REPLAY" : "CONFLICT";
}

export function clearLocalRuntimeRecoveryClosureEvidenceReplayRegistry(): void { registry.clear(); }
