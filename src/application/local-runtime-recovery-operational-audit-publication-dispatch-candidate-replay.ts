import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "./local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationRequestCertification } from "./local-runtime-recovery-operational-audit-publication-request-certification.js";
import { assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate } from "./local-runtime-recovery-operational-audit-publication-dispatch-candidate.js";

export type OperationalAuditPublicationDispatchCandidateReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate(input: { candidate: LocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate; requestCertification: LocalRuntimeRecoveryOperationalAuditPublicationRequestCertification }): OperationalAuditPublicationDispatchCandidateReplayDisposition {
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidate(input.candidate, input.requestCertification);
  const key = `${input.candidate.candidateId}:${input.candidate.requestId}`;
  const previous = registry.get(key);
  if (!previous) { registry.set(key, input.candidate.decisionFingerprint); return "ADMIT"; }
  if (previous === input.candidate.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchCandidateReplayRegistry(): void { registry.clear(); }
