import type { LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";
import { assertLocalRuntimeRecoveryDecisionIntegrity } from "./local-runtime-recovery-decision-integrity.js";
import type { LocalRuntimeRecoveryDecisionReplayResult } from "./local-runtime-recovery-decision-replay-guard.js";
import { assertLocalRuntimeRecoveryDecisionReplayResult } from "./local-runtime-recovery-decision-replay-guard.js";
import type { LocalRuntimeSafetyCertificationEnvelope } from "./local-runtime-safety-certification.js";

export type LocalRuntimeRecoveryDecisionAuditEvidence = Readonly<{
  evidenceId: string;
  decisionId: string;
  envelopeId: string;
  journeyId: string;
  certificationId: string;
  failureEvidenceId: string;
  dispositionId: string;
  scenario: LocalRuntimeRecoveryDecision["scenario"];
  action: LocalRuntimeRecoveryDecision["action"];
  continuityState: LocalRuntimeRecoveryDecision["continuityState"];
  replayDisposition: LocalRuntimeRecoveryDecisionReplayResult["disposition"];
  admitted: boolean;
  fingerprint: string;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryDecisionAuditEvidence(input: { evidenceId: string; decision: LocalRuntimeRecoveryDecision; envelope: LocalRuntimeSafetyCertificationEnvelope; replay: LocalRuntimeRecoveryDecisionReplayResult }): LocalRuntimeRecoveryDecisionAuditEvidence {
  if (!input.evidenceId.trim()) throw new Error("Recovery decision audit evidence identity is required.");
  assertLocalRuntimeRecoveryDecisionIntegrity(input.decision, input.envelope);
  assertLocalRuntimeRecoveryDecisionReplayResult(input.replay);
  if (input.replay.decisionId !== input.decision.decisionId || input.replay.fingerprint !== input.decision.decisionFingerprint) throw new Error("Recovery decision audit replay drift.");
  const fingerprint = [input.decision.decisionFingerprint, input.replay.disposition, String(input.replay.admitted)].join("|");
  return Object.freeze({ evidenceId: input.evidenceId, decisionId: input.decision.decisionId, envelopeId: input.envelope.envelopeId, journeyId: input.envelope.journeyId, certificationId: input.envelope.certificationId, failureEvidenceId: input.envelope.evidenceId, dispositionId: input.envelope.dispositionId, scenario: input.decision.scenario, action: input.decision.action, continuityState: input.decision.continuityState, replayDisposition: input.replay.disposition, admitted: input.replay.admitted, fingerprint, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryDecisionAuditEvidence(evidence: LocalRuntimeRecoveryDecisionAuditEvidence, decision: LocalRuntimeRecoveryDecision, envelope: LocalRuntimeSafetyCertificationEnvelope, replay: LocalRuntimeRecoveryDecisionReplayResult): void {
  if (!evidence.syntheticOnly) throw new Error("Recovery decision audit evidence must be synthetic-only.");
  assertLocalRuntimeRecoveryDecisionIntegrity(decision, envelope);
  assertLocalRuntimeRecoveryDecisionReplayResult(replay);
  if (evidence.decisionId !== decision.decisionId || evidence.envelopeId !== envelope.envelopeId || evidence.journeyId !== envelope.journeyId || evidence.certificationId !== envelope.certificationId || evidence.failureEvidenceId !== envelope.evidenceId || evidence.dispositionId !== envelope.dispositionId) throw new Error("Recovery decision audit identity drift.");
  if (evidence.scenario !== decision.scenario || evidence.action !== decision.action || evidence.continuityState !== decision.continuityState || evidence.replayDisposition !== replay.disposition || evidence.admitted !== replay.admitted) throw new Error("Recovery decision audit semantic drift.");
  const expectedFingerprint = [decision.decisionFingerprint, replay.disposition, String(replay.admitted)].join("|");
  if (evidence.fingerprint !== expectedFingerprint) throw new Error("Recovery decision audit fingerprint drift.");
}
