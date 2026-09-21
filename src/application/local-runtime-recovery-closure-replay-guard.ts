import type { IntegratedLocalRuntimeRecoveryClosureCertification } from "./integrated-local-runtime-recovery-closure-certification.js";
import { assertIntegratedLocalRuntimeRecoveryClosureCertification } from "./integrated-local-runtime-recovery-closure-certification.js";

export type LocalRuntimeRecoveryClosureReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
export type LocalRuntimeRecoveryClosureRegistry = Map<string, string>;
export type LocalRuntimeRecoveryClosureReplayResult = Readonly<{
  certificationId: string;
  executionId: string;
  fingerprint: string;
  disposition: LocalRuntimeRecoveryClosureReplayDisposition;
  admitted: boolean;
  syntheticOnly: true;
}>;

export function assessLocalRuntimeRecoveryClosureReplay(input: {
  certification: IntegratedLocalRuntimeRecoveryClosureCertification;
  continuity: Parameters<typeof assertIntegratedLocalRuntimeRecoveryClosureCertification>[1];
  receipt: Parameters<typeof assertIntegratedLocalRuntimeRecoveryClosureCertification>[2];
  closure: Parameters<typeof assertIntegratedLocalRuntimeRecoveryClosureCertification>[3];
  completionProof: Parameters<typeof assertIntegratedLocalRuntimeRecoveryClosureCertification>[4];
  acknowledgement: Parameters<typeof assertIntegratedLocalRuntimeRecoveryClosureCertification>[5];
  acknowledgementCertification: Parameters<typeof assertIntegratedLocalRuntimeRecoveryClosureCertification>[6];
  registry: LocalRuntimeRecoveryClosureRegistry;
}): LocalRuntimeRecoveryClosureReplayResult {
  assertIntegratedLocalRuntimeRecoveryClosureCertification({ ...input.certification, decisionFingerprint: input.completionProof.decisionFingerprint }, input.continuity, input.receipt, input.closure, input.completionProof, input.acknowledgement, input.acknowledgementCertification);
  const key = input.certification.certificationId;
  const existing = input.registry.get(key);
  if (existing === undefined) {
    input.registry.set(key, input.certification.decisionFingerprint);
    return Object.freeze({ certificationId: key, executionId: input.certification.executionId, fingerprint: input.certification.decisionFingerprint, disposition: "ADMIT", admitted: true, syntheticOnly: true });
  }
  if (existing === input.certification.decisionFingerprint) return Object.freeze({ certificationId: key, executionId: input.certification.executionId, fingerprint: input.certification.decisionFingerprint, disposition: "REPLAY", admitted: false, syntheticOnly: true });
  return Object.freeze({ certificationId: key, executionId: input.certification.executionId, fingerprint: input.certification.decisionFingerprint, disposition: "CONFLICT", admitted: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryClosureReplayResult(result: LocalRuntimeRecoveryClosureReplayResult): void {
  if (!result.syntheticOnly || !result.certificationId.trim() || !result.executionId.trim() || !result.fingerprint.trim()) throw new Error("Recovery closure replay result identity is invalid.");
  if (result.disposition === "ADMIT" && !result.admitted) throw new Error("Admitted closure replay must be marked admitted.");
  if (result.disposition !== "ADMIT" && result.admitted) throw new Error("Replay or conflict closure cannot be admitted.");
}
