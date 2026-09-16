import type { LocalRuntimeRecoveryOperationalAuditPublicationRequest } from "./local-runtime-recovery-operational-audit-publication-request.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationCertification } from "./local-runtime-recovery-operational-audit-publication-certification.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationEnvelope } from "./local-runtime-recovery-operational-audit-publication.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationRequest } from "./local-runtime-recovery-operational-audit-publication-request.js";

export type OperationalAuditPublicationRequestReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryOperationalAuditPublicationRequest(input: { request: LocalRuntimeRecoveryOperationalAuditPublicationRequest; certification: LocalRuntimeRecoveryOperationalAuditPublicationCertification; envelope: LocalRuntimeRecoveryOperationalAuditPublicationEnvelope }): OperationalAuditPublicationRequestReplayDisposition {
  assertLocalRuntimeRecoveryOperationalAuditPublicationRequest(input.request, input.certification, input.envelope);
  const key = `${input.request.requestId}:${input.request.publicationCertificationId}`;
  const previous = registry.get(key);
  if (!previous) { registry.set(key, input.request.decisionFingerprint); return "ADMIT"; }
  if (previous === input.request.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function resetLocalRuntimeRecoveryOperationalAuditPublicationRequestReplayRegistry(): void { registry.clear(); }
