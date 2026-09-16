import type { LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";
import { assertLocalRuntimeRecoveryDecisionIntegrity } from "./local-runtime-recovery-decision-integrity.js";
import type { LocalRuntimeSafetyCertificationEnvelope } from "./local-runtime-safety-certification.js";

export type LocalRuntimeRecoveryDecisionReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export type LocalRuntimeRecoveryDecisionReplayResult = Readonly<{
  decisionId: string;
  fingerprint: string;
  disposition: LocalRuntimeRecoveryDecisionReplayDisposition;
  admitted: boolean;
  syntheticOnly: true;
}>;

export type LocalRuntimeRecoveryDecisionReplayRegistry = ReadonlyMap<string, string>;

export function assessLocalRuntimeRecoveryDecisionReplay(input: { decision: LocalRuntimeRecoveryDecision; envelope: LocalRuntimeSafetyCertificationEnvelope; registry: LocalRuntimeRecoveryDecisionReplayRegistry }): LocalRuntimeRecoveryDecisionReplayResult {
  assertLocalRuntimeRecoveryDecisionIntegrity(input.decision, input.envelope);
  const existing = input.registry.get(input.decision.decisionId);
  if (existing === undefined) return Object.freeze({ decisionId: input.decision.decisionId, fingerprint: input.decision.decisionFingerprint, disposition: "ADMIT", admitted: input.decision.admitted, syntheticOnly: true });
  if (existing === input.decision.decisionFingerprint) return Object.freeze({ decisionId: input.decision.decisionId, fingerprint: input.decision.decisionFingerprint, disposition: "REPLAY", admitted: false, syntheticOnly: true });
  return Object.freeze({ decisionId: input.decision.decisionId, fingerprint: input.decision.decisionFingerprint, disposition: "CONFLICT", admitted: false, syntheticOnly: true });
}

export function recordLocalRuntimeRecoveryDecisionReplay(registry: Map<string, string>, result: LocalRuntimeRecoveryDecisionReplayResult): void {
  if (!result.syntheticOnly) throw new Error("Recovery decision replay result must be synthetic-only.");
  if (result.disposition !== "ADMIT") throw new Error("Only an admitted recovery decision may be registered.");
  const existing = registry.get(result.decisionId);
  if (existing !== undefined && existing !== result.fingerprint) throw new Error("Recovery decision replay identity conflict.");
  registry.set(result.decisionId, result.fingerprint);
}

export function assertLocalRuntimeRecoveryDecisionReplayResult(result: LocalRuntimeRecoveryDecisionReplayResult): void {
  if (!result.syntheticOnly) throw new Error("Recovery decision replay result must be synthetic-only.");
  if (!result.decisionId.trim() || !result.fingerprint.trim()) throw new Error("Recovery decision replay identity is required.");
  if (result.disposition !== "ADMIT" && result.admitted) throw new Error("Replay or conflict result cannot be admitted.");
}
