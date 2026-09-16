import type { LocalRuntimeSafetyCertificationEnvelope } from "./local-runtime-safety-certification.js";
import { assertLocalRuntimeSafetyEnvelope } from "./local-runtime-safety-certification.js";
import { assessLocalRuntimeRecoveryContinuity, assertLocalRuntimeRecoveryContinuityDecision, type LocalRuntimeRecoveryContinuityDecision } from "./local-runtime-recovery-continuity-gate.js";

export type LocalRuntimeRecoveryCertification = Readonly<{
  certificationId: string;
  envelopeId: string;
  scenario: LocalRuntimeSafetyCertificationEnvelope["scenario"];
  disposition: LocalRuntimeSafetyCertificationEnvelope["disposition"];
  continuityState: LocalRuntimeRecoveryContinuityDecision["state"];
  admitted: boolean;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeRecovery(input: { certificationId: string; envelope: LocalRuntimeSafetyCertificationEnvelope }): LocalRuntimeRecoveryCertification {
  if (!input.certificationId.trim()) throw new Error("Local runtime recovery certification identity is required.");
  assertLocalRuntimeSafetyEnvelope(input.envelope);
  const continuity = assessLocalRuntimeRecoveryContinuity(input.envelope);
  assertLocalRuntimeRecoveryContinuityDecision(continuity);
  return Object.freeze({ certificationId: input.certificationId, envelopeId: input.envelope.envelopeId, scenario: input.envelope.scenario, disposition: input.envelope.disposition, continuityState: continuity.state, admitted: continuity.admitted, certified: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryCertification(certification: LocalRuntimeRecoveryCertification): void {
  if (!certification.certified || !certification.syntheticOnly) throw new Error("Local runtime recovery certification must be synthetic-only.");
  if (!certification.certificationId.trim() || !certification.envelopeId.trim()) throw new Error("Local runtime recovery certification identity is required.");
  if ((certification.continuityState === "OPERATOR_REVIEW_REQUIRED" || certification.continuityState === "RECONCILIATION_REQUIRED") && certification.admitted) throw new Error("Blocked recovery continuity cannot be admitted.");
}
