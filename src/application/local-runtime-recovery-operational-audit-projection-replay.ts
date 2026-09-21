import type { LocalRuntimeRecoveryOperationalAuditProjection } from "./local-runtime-recovery-operational-audit-projection.js";
import { assertLocalRuntimeRecoveryOperationalAuditProjection } from "./local-runtime-recovery-operational-audit-projection.js";
import type { LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification } from "./local-runtime-recovery-final-closure-audit-evidence-certification.js";

export type OperationalAuditProjectionReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryOperationalAuditProjection(input: { projection: LocalRuntimeRecoveryOperationalAuditProjection; evidenceCertification: LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification }): OperationalAuditProjectionReplayDisposition {
  assertLocalRuntimeRecoveryOperationalAuditProjection({ ...input.projection, decisionFingerprint: input.evidenceCertification.decisionFingerprint }, input.evidenceCertification);
  const key = `${input.projection.projectionId}:${input.projection.evidenceCertificationId}`;
  const previous = registry.get(key);
  if (!previous) {
    registry.set(key, input.projection.decisionFingerprint);
    return "ADMIT";
  }
  if (previous === input.projection.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function resetLocalRuntimeRecoveryOperationalAuditProjectionReplayRegistry(): void {
  registry.clear();
}
