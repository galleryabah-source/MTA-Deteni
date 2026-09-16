import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryDecision } from "../src/application/local-runtime-recovery-decision-integrity.js";
import { assessLocalRuntimeRecoveryDecisionReplay } from "../src/application/local-runtime-recovery-decision-replay-guard.js";
import { createLocalRuntimeRecoveryDecisionAuditEvidence, assertLocalRuntimeRecoveryDecisionAuditEvidence } from "../src/application/local-runtime-recovery-decision-audit-evidence.js";
import type { LocalRuntimeSafetyCertificationEnvelope } from "../src/application/local-runtime-safety-certification.js";

const envelope = { envelopeId: "ENV-AE", journeyId: "J-AE", certificationId: "C-AE", evidenceId: "E-AE", dispositionId: "D-AE", scenario: "MALFORMED_REQUEST", disposition: "REJECT_AND_CORRECT_REQUEST", safeToRetry: true, operatorReviewRequired: false, certified: true, syntheticOnly: true } as LocalRuntimeSafetyCertificationEnvelope;

test("P13.12841-12960: audit evidence preserves the complete decision identity chain", () => {
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-AE", envelope });
  const registry = new Map<string, string>();
  const replay = assessLocalRuntimeRecoveryDecisionReplay({ decision, envelope, registry });
  const evidence = createLocalRuntimeRecoveryDecisionAuditEvidence({ evidenceId: "AUD-AE", decision, envelope, replay });
  assertLocalRuntimeRecoveryDecisionAuditEvidence(evidence, decision, envelope, replay);
  assert.equal(evidence.syntheticOnly, true);
  assert.equal(evidence.failureEvidenceId, envelope.evidenceId);
  assert.equal(evidence.dispositionId, envelope.dispositionId);
});

test("P13.12841-12960: audit evidence drift fails closed", () => {
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-AE-DRIFT", envelope });
  const replay = assessLocalRuntimeRecoveryDecisionReplay({ decision, envelope, registry: new Map() });
  const evidence = createLocalRuntimeRecoveryDecisionAuditEvidence({ evidenceId: "AUD-AE-DRIFT", decision, envelope, replay });
  assert.throws(() => assertLocalRuntimeRecoveryDecisionAuditEvidence({ ...evidence, action: "OPERATOR_REVIEW" }, decision, envelope, replay), /semantic drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionAuditEvidence({ ...evidence, syntheticOnly: false }, decision, envelope, replay), /synthetic-only/i);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionAuditEvidence({ ...evidence, fingerprint: `${evidence.fingerprint}-tampered` }, decision, envelope, replay), /fingerprint drift/i);
});
