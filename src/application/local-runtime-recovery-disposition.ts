import type { LocalRuntimeFailureEvidence } from "./local-runtime-failure-evidence.js";
import { assertLocalRuntimeFailureEvidence } from "./local-runtime-failure-evidence.js";
import { resolveLocalRuntimeRecoveryDisposition, type LocalRuntimeFailureScenario, type LocalRuntimeRecoveryDisposition } from "./local-runtime-failure-recovery-matrix.js";

export type LocalRuntimeRecoveryDispositionEvidence = Readonly<{
  dispositionId: string;
  failureId: string;
  evidenceId: string;
  scenario: LocalRuntimeFailureScenario;
  failureClass: LocalRuntimeFailureEvidence["failureClass"];
  disposition: LocalRuntimeRecoveryDisposition;
  retryAllowed: boolean;
  operatorReviewRequired: boolean;
  syntheticOnly: true;
}>;

export function createLocalRuntimeRecoveryDisposition(input: { dispositionId: string; evidence: LocalRuntimeFailureEvidence; scenario: LocalRuntimeFailureScenario }): LocalRuntimeRecoveryDispositionEvidence {
  if (!input.dispositionId.trim()) throw new Error("Local runtime recovery disposition identity is required.");
  assertLocalRuntimeFailureEvidence(input.evidence);
  const expected = resolveLocalRuntimeRecoveryDisposition({ scenario: input.scenario, failureClass: input.evidence.failureClass });
  return Object.freeze({ dispositionId: input.dispositionId, failureId: input.evidence.failureId, evidenceId: input.evidence.evidenceId, scenario: input.scenario, failureClass: input.evidence.failureClass, disposition: expected.disposition, retryAllowed: expected.retryAllowed, operatorReviewRequired: expected.requiresOperatorReview, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryDisposition(input: LocalRuntimeRecoveryDispositionEvidence): void {
  if (!input.syntheticOnly) throw new Error("Local runtime recovery disposition must be synthetic-only.");
  if (!input.dispositionId.trim() || !input.failureId.trim() || !input.evidenceId.trim()) throw new Error("Local runtime recovery disposition identity is required.");
  const expected = resolveLocalRuntimeRecoveryDisposition({ scenario: input.scenario, failureClass: input.failureClass });
  if (input.failureId === "" || input.evidenceId === "") throw new Error("Local runtime recovery disposition binding is required.");
  if (input.disposition !== expected.disposition || input.retryAllowed !== expected.retryAllowed || input.operatorReviewRequired !== expected.requiresOperatorReview) throw new Error("Local runtime recovery disposition drift.");
}
