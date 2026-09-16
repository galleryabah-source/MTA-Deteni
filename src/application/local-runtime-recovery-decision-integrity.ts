import { assertLocalRuntimeSafetyEnvelope, type LocalRuntimeSafetyCertificationEnvelope } from "./local-runtime-safety-certification.js";
import { assessLocalRuntimeRecoveryContinuity, assertLocalRuntimeRecoveryContinuityDecision, type LocalRuntimeRecoveryContinuityDecision } from "./local-runtime-recovery-continuity-gate.js";
import { resolveLocalRuntimeRecoveryAction, assertLocalRuntimeRecoveryActionDecision, type LocalRuntimeRecoveryActionDecision } from "./local-runtime-recovery-action-gate.js";

export type LocalRuntimeRecoveryDecision = Readonly<{
  decisionId: string;
  envelopeId: string;
  journeyId: string;
  certificationId: string;
  evidenceId: string;
  dispositionId: string;
  scenario: LocalRuntimeSafetyCertificationEnvelope["scenario"];
  disposition: LocalRuntimeSafetyCertificationEnvelope["disposition"];
  continuityState: LocalRuntimeRecoveryContinuityDecision["state"];
  action: LocalRuntimeRecoveryActionDecision["action"];
  admitted: boolean;
  decisionFingerprint: string;
  certified: true;
  syntheticOnly: true;
}>;

function requireIdentity(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} is required.`);
}

export function createLocalRuntimeRecoveryDecision(input: { decisionId: string; envelope: LocalRuntimeSafetyCertificationEnvelope }): LocalRuntimeRecoveryDecision {
  requireIdentity(input.decisionId, "Local runtime recovery decision identity");
  assertLocalRuntimeSafetyEnvelope(input.envelope);
  const action = resolveLocalRuntimeRecoveryAction(input.envelope);
  assertLocalRuntimeRecoveryActionDecision(action);
  const continuity = assessLocalRuntimeRecoveryContinuity(input.envelope);
  assertLocalRuntimeRecoveryContinuityDecision(continuity);
  const decisionFingerprint = [
    input.envelope.envelopeId,
    input.envelope.journeyId,
    input.envelope.certificationId,
    input.envelope.evidenceId,
    input.envelope.dispositionId,
    input.envelope.scenario,
    input.envelope.disposition,
    continuity.state,
    action.action,
    String(action.admitted)
  ].join("|");
  return Object.freeze({
    decisionId: input.decisionId,
    envelopeId: input.envelope.envelopeId,
    journeyId: input.envelope.journeyId,
    certificationId: input.envelope.certificationId,
    evidenceId: input.envelope.evidenceId,
    dispositionId: input.envelope.dispositionId,
    scenario: input.envelope.scenario,
    disposition: input.envelope.disposition,
    continuityState: continuity.state,
    action: action.action,
    admitted: action.admitted,
    decisionFingerprint,
    certified: true,
    syntheticOnly: true
  });
}

export function assertLocalRuntimeRecoveryDecisionIntegrity(decision: LocalRuntimeRecoveryDecision, envelope: LocalRuntimeSafetyCertificationEnvelope): void {
  if (!decision.certified || !decision.syntheticOnly) throw new Error("Local runtime recovery decision must be certified synthetic-only.");
  requireIdentity(decision.decisionId, "Local runtime recovery decision identity");
  assertLocalRuntimeSafetyEnvelope(envelope);
  const expected = createLocalRuntimeRecoveryDecision({ decisionId: decision.decisionId, envelope });
  const fields: Array<keyof LocalRuntimeRecoveryDecision> = ["envelopeId", "journeyId", "certificationId", "evidenceId", "dispositionId", "scenario", "disposition", "continuityState", "action", "admitted", "decisionFingerprint"];
  for (const field of fields) {
    if (decision[field] !== expected[field]) throw new Error(`Local runtime recovery decision integrity drift: ${field}.`);
  }
  if ((decision.continuityState === "OPERATOR_REVIEW_REQUIRED" || decision.continuityState === "RECONCILIATION_REQUIRED") && decision.admitted) throw new Error("Blocked recovery continuity cannot be admitted.");
}
