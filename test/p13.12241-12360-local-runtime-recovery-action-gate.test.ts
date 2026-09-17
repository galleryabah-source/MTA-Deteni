import assert from "node:assert/strict";
import test from "node:test";
import { getLocalRuntimeFailureMatrix } from "../src/application/local-runtime-failure-recovery-matrix.js";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import { createLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import { certifyLocalRuntimeFailureRecoveryJourney } from "../src/application/local-runtime-failure-recovery-journey.js";
import { certifyLocalRuntimeSafetyEnvelope } from "../src/application/local-runtime-safety-certification.js";
import { assertLocalRuntimeRecoveryActionDecision, resolveLocalRuntimeRecoveryAction } from "../src/application/local-runtime-recovery-action-gate.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-G", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-G", certificationJourneyId: "J-G", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-G", executionId: "EXEC-G", deviceId: "DEV-G", installationId: "INST-G", networkScopeId: "NET-G", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-G", actorId: "ACT-G", device: { deviceId: "DEV-G", installationId: "INST-G", networkScopeId: "NET-G", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-G", boundary: { serviceId: "SVC-G", listenScope: "LOOPBACK_ONLY", allowsInternetExposure: false, requiresAuthenticatedDevice: true } } as LocalRuntimeRequest;

function envelopeFor(index: number) {
  const entry = getLocalRuntimeFailureMatrix()[index];
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: `E-G-${index}`, failureId: `F-G-${index}`, failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T03:20:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: `O-G-${index}`, evidence });
  const certification = certifyLocalRuntimeFailure({ certificationId: `C-G-${index}`, evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: `D-G-${index}`, evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: `J-G-${index}`, scenario: entry.scenario, evidence, certification, disposition });
  return certifyLocalRuntimeSafetyEnvelope({ envelopeId: `ENV-G-${index}`, journey, certification, disposition });
}

test("P13.12241-12360: recovery action is deterministic across all five scenarios", () => {
  const expected = ["RETRY_AFTER_CORRECTION", "RETRY_AFTER_REAUTHENTICATION", "RETRY_AFTER_SCOPE_REOPEN", "OPERATOR_REVIEW", "RECONCILE_BEFORE_RETRY"];
  for (let i = 0; i < 5; i += 1) {
    const decision = resolveLocalRuntimeRecoveryAction(envelopeFor(i));
    assert.equal(decision.action, expected[i]);
    assertLocalRuntimeRecoveryActionDecision(decision);
  }
});

test("P13.12241-12360: blocked actions cannot be admitted", () => {
  const decision = resolveLocalRuntimeRecoveryAction(envelopeFor(3));
  assert.equal(decision.admitted, false);
  assert.equal(decision.requiresOperatorReview, true);
  assert.throws(() => assertLocalRuntimeRecoveryActionDecision({ ...decision, admitted: true }), /cannot be admitted|automatically/i);
});
