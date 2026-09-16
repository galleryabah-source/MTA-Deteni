import { assertLocalRuntimeRecoveryDecisionIntegrity, type LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";
import type { LocalRuntimeSafetyCertificationEnvelope } from "./local-runtime-safety-certification.js";

export type RecoveryDecisionReplayResult = Readonly<{
  action: "ADMIT" | "REPLAY" | "CONFLICT";
  decisionId: string;
  decisionFingerprint: string;
  syntheticOnly: true;
}>;

export class MemoryRecoveryDecisionRegistry {
  private readonly entries = new Map<string, string>();

  admit(decision: LocalRuntimeRecoveryDecision, envelope: LocalRuntimeSafetyCertificationEnvelope): RecoveryDecisionReplayResult {
    assertLocalRuntimeRecoveryDecisionIntegrity(decision, envelope);
    const existing = this.entries.get(decision.decisionId);
    if (existing === undefined) {
      this.entries.set(decision.decisionId, decision.decisionFingerprint);
      return Object.freeze({ action: "ADMIT", decisionId: decision.decisionId, decisionFingerprint: decision.decisionFingerprint, syntheticOnly: true });
    }
    if (existing === decision.decisionFingerprint) {
      return Object.freeze({ action: "REPLAY", decisionId: decision.decisionId, decisionFingerprint: decision.decisionFingerprint, syntheticOnly: true });
    }
    return Object.freeze({ action: "CONFLICT", decisionId: decision.decisionId, decisionFingerprint: decision.decisionFingerprint, syntheticOnly: true });
  }
}

export function assertRecoveryDecisionReplayResult(result: RecoveryDecisionReplayResult): void {
  if (!result.syntheticOnly) throw new Error("Recovery decision replay result must be synthetic-only.");
  if (!result.decisionId.trim() || !result.decisionFingerprint.trim()) throw new Error("Recovery decision replay identity is required.");
  if (result.action === "CONFLICT") throw new Error("Recovery decision replay conflict requires review.");
}
