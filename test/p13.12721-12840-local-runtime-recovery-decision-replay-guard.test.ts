import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryDecision } from "../src/application/local-runtime-recovery-decision-integrity.js";
import { assessLocalRuntimeRecoveryDecisionReplay, recordLocalRuntimeRecoveryDecisionReplay, assertLocalRuntimeRecoveryDecisionReplayResult } from "../src/application/local-runtime-recovery-decision-replay-guard.js";
import type { LocalRuntimeSafetyCertificationEnvelope } from "../src/application/local-runtime-safety-certification.js";

const envelope = {
  envelopeId: "ENV-RG",
  journeyId: "J-RG",
  certificationId: "C-RG",
  evidenceId: "E-RG",
  dispositionId: "D-RG",
  scenario: "MALFORMED_REQUEST",
  disposition: "REJECT_AND_CORRECT_REQUEST",
  safeToRetry: true,
  operatorReviewRequired: false,
  certified: true,
  syntheticOnly: true
} as LocalRuntimeSafetyCertificationEnvelope;

// The decision constructor is intentionally not duplicated here; use a minimal certified envelope only for replay identity semantics.
test("P13.12721-12840: first decision is ADMIT and identical replay is REPLAY", () => {
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-RG", envelope });
  const registry = new Map<string, string>();
  const first = assessLocalRuntimeRecoveryDecisionReplay({ decision, envelope, registry });
  assert.equal(first.disposition, "ADMIT");
  assert.equal(first.admitted, true);
  recordLocalRuntimeRecoveryDecisionReplay(registry, first);
  const replay = assessLocalRuntimeRecoveryDecisionReplay({ decision, envelope, registry });
  assert.equal(replay.disposition, "REPLAY");
  assert.equal(replay.admitted, false);
  assertLocalRuntimeRecoveryDecisionReplayResult(replay);
});

test("P13.12721-12840: fingerprint substitution is CONFLICT and cannot be registered", () => {
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-CONFLICT", envelope });
  const registry = new Map([[decision.decisionId, `${decision.decisionFingerprint}-tampered`]]);
  const result = assessLocalRuntimeRecoveryDecisionReplay({ decision, envelope, registry });
  assert.equal(result.disposition, "CONFLICT");
  assert.equal(result.admitted, false);
  assert.throws(() => recordLocalRuntimeRecoveryDecisionReplay(registry, result), /Only an admitted/i);
});
