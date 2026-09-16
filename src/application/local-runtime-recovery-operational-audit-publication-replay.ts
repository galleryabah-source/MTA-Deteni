import type { LocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "./local-runtime-recovery-operational-audit-publication.js";
import type { LocalRuntimeRecoveryOperationalAuditProjectionCertification } from "./local-runtime-recovery-operational-audit-projection-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditProjection } from "./local-runtime-recovery-operational-audit-projection.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "./local-runtime-recovery-operational-audit-publication.js";

export type OperationalAuditPublicationReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryOperationalAuditPublication(input: { envelope: LocalRuntimeRecoveryOperationalAuditPublicationEnvelope; certification: LocalRuntimeRecoveryOperationalAuditProjectionCertification; projection: LocalRuntimeRecoveryOperationalAuditProjection }): OperationalAuditPublicationReplayDisposition {
  assertLocalRuntimeRecoveryOperationalAuditPublicationEnvelope(input.envelope, input.certification, input.projection);
  const key = `${input.envelope.publicationId}:${input.envelope.certificationId}`;
  const previous = registry.get(key);
  if (!previous) { registry.set(key, input.envelope.decisionFingerprint); return "ADMIT"; }
  if (previous === input.envelope.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function resetLocalRuntimeRecoveryOperationalAuditPublicationReplayRegistry(): void { registry.clear(); }
