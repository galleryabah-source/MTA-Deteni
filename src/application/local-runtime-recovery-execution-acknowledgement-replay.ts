import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";
import { assertLocalRuntimeRecoveryExecutionAcknowledgement } from "./local-runtime-recovery-execution-acknowledgement.js";

export type LocalRuntimeRecoveryExecutionAcknowledgementReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export type LocalRuntimeRecoveryExecutionAcknowledgementReplayResult = Readonly<{
  acknowledgementId: string;
  fingerprint: string;
  disposition: LocalRuntimeRecoveryExecutionAcknowledgementReplayDisposition;
  admitted: boolean;
  syntheticOnly: true;
}>;

export type LocalRuntimeRecoveryExecutionAcknowledgementRegistry = Map<string, string>;

export function assessLocalRuntimeRecoveryExecutionAcknowledgementReplay(input: {
  acknowledgement: LocalRuntimeRecoveryExecutionAcknowledgement;
  registry: LocalRuntimeRecoveryExecutionAcknowledgementRegistry;
}): LocalRuntimeRecoveryExecutionAcknowledgementReplayResult {
  assertLocalRuntimeRecoveryExecutionAcknowledgement(input.acknowledgement, input.acknowledgement as never, input.acknowledgement as never, input.acknowledgement as never, input.acknowledgement as never, input.acknowledgement as never, input.acknowledgement as never);
  const existing = input.registry.get(input.acknowledgement.acknowledgementId);
  if (existing === undefined) {
    input.registry.set(input.acknowledgement.acknowledgementId, input.acknowledgement.decisionFingerprint);
    return Object.freeze({ acknowledgementId: input.acknowledgement.acknowledgementId, fingerprint: input.acknowledgement.decisionFingerprint, disposition: "ADMIT", admitted: true, syntheticOnly: true });
  }
  if (existing === input.acknowledgement.decisionFingerprint) return Object.freeze({ acknowledgementId: input.acknowledgement.acknowledgementId, fingerprint: input.acknowledgement.decisionFingerprint, disposition: "REPLAY", admitted: false, syntheticOnly: true });
  return Object.freeze({ acknowledgementId: input.acknowledgement.acknowledgementId, fingerprint: input.acknowledgement.decisionFingerprint, disposition: "CONFLICT", admitted: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryExecutionAcknowledgementReplayResult(result: LocalRuntimeRecoveryExecutionAcknowledgementReplayResult): void {
  if (!result.syntheticOnly) throw new Error("Acknowledgement replay result must be synthetic-only.");
  if (!result.acknowledgementId.trim() || !result.fingerprint.trim()) throw new Error("Acknowledgement replay identity is required.");
  if (result.disposition === "ADMIT" && !result.admitted) throw new Error("Admitted acknowledgement replay must be marked admitted.");
  if (result.disposition !== "ADMIT" && result.admitted) throw new Error("Replay or conflict acknowledgement cannot be admitted.");
}
