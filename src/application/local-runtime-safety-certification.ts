import type { LocalRuntimeFailureRecoveryJourney } from "./local-runtime-failure-recovery-journey.js";
import type { LocalRuntimeFailureCertification } from "./local-runtime-failure-certification.js";
import type { LocalRuntimeRecoveryDispositionEvidence } from "./local-runtime-recovery-disposition.js";
import { resolveLocalRuntimeRecoveryDisposition } from "./local-runtime-failure-recovery-matrix.js";

export type LocalRuntimeSafetyCertificationEnvelope = Readonly<{
  envelopeId: string;
  journeyId: string;
  certificationId: string;
  evidenceId: string;
  dispositionId: string;
  scenario: LocalRuntimeFailureRecoveryJourney["scenario"];
  disposition: LocalRuntimeFailureRecoveryJourney["disposition"];
  safeToRetry: boolean;
  operatorReviewRequired: boolean;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeSafetyEnvelope(input: { envelopeId: string; journey: LocalRuntimeFailureRecoveryJourney; certification: LocalRuntimeFailureCertification; disposition: LocalRuntimeRecoveryDispositionEvidence }): LocalRuntimeSafetyCertificationEnvelope {
  if (!input.envelopeId.trim()) throw new Error("Local runtime safety envelope identity is required.");
  if (input.journey.certificationId !== input.certification.certificationId || input.journey.evidenceId !== input.certification.evidenceId) throw new Error("Local runtime safety certification drift.");
  if (input.journey.dispositionId !== input.disposition.dispositionId || input.journey.evidenceId !== input.disposition.evidenceId) throw new Error("Local runtime safety disposition drift.");
  if (!input.journey.syntheticOnly || !input.certification.syntheticOnly || !input.disposition.syntheticOnly) throw new Error("Local runtime safety envelope must be synthetic-only.");
  const expected = resolveLocalRuntimeRecoveryDisposition({ scenario: input.journey.scenario, failureClass: input.certification.failureClass });
  if (input.disposition.disposition !== expected.disposition || input.disposition.retryAllowed !== expected.retryAllowed || input.disposition.operatorReviewRequired !== expected.requiresOperatorReview) throw new Error("Local runtime safety policy drift.");
  if (input.journey.retryAllowed !== expected.retryAllowed) throw new Error("Local runtime safety journey retry policy drift.");
  return Object.freeze({ envelopeId: input.envelopeId, journeyId: input.journey.journeyId, certificationId: input.certification.certificationId, evidenceId: input.certification.evidenceId, dispositionId: input.disposition.dispositionId, scenario: input.journey.scenario, disposition: input.journey.disposition, safeToRetry: input.journey.retryAllowed, operatorReviewRequired: input.disposition.operatorReviewRequired, certified: true, syntheticOnly: true });
}

export function assertLocalRuntimeSafetyEnvelope(envelope: LocalRuntimeSafetyCertificationEnvelope): void {
  if (!envelope.certified || !envelope.syntheticOnly) throw new Error("Local runtime safety envelope is not certified synthetic-only.");
  if (!envelope.envelopeId.trim() || !envelope.journeyId.trim() || !envelope.certificationId.trim() || !envelope.evidenceId.trim() || !envelope.dispositionId.trim()) throw new Error("Local runtime safety envelope identity is required.");
  const expected = resolveLocalRuntimeRecoveryDisposition({ scenario: envelope.scenario, failureClass: envelope.operatorReviewRequired ? "EXECUTION_REJECTED" : envelope.safeToRetry ? (envelope.scenario === "MALFORMED_REQUEST" ? "REQUEST_REJECTED" : envelope.scenario === "EXPIRED_HANDSHAKE" ? "HANDSHAKE_REJECTED" : "SESSION_SCOPE_REJECTED") : "EXECUTION_REJECTED" });
  if (envelope.disposition !== expected.disposition || envelope.safeToRetry !== expected.retryAllowed || envelope.operatorReviewRequired !== expected.requiresOperatorReview) throw new Error("Local runtime safety envelope policy drift: automatic retry/operator review mismatch.");
  if (envelope.operatorReviewRequired && envelope.safeToRetry) throw new Error("Local runtime safety envelope cannot permit automatic retry when operator review is required.");
}
