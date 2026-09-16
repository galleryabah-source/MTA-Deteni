import assert from "node:assert/strict";
import test from "node:test";
import { getLocalRuntimeFailureMatrix } from "../src/application/local-runtime-failure-recovery-matrix.js";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import { createLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import { certifyLocalRuntimeFailureRecoveryJourney } from "../src/application/local-runtime-failure-recovery-journey.js";
import { certifyLocalRuntimeSafetyEnvelope } from "../src/application/local-runtime-safety-certification.js";
import { assessLocalRuntimeRecoveryContinuity, assertLocalRuntimeRecoveryContinuityDecision } from "../src/application/local-runtime-recovery-continuity-gate.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-CG", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-CG", certificationJourneyId: "J-CG", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-CG", executionId: "EXEC-CG", deviceId: "DEV-CG", installationId: "INST-CG", networkScopeId: "NET-CG", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-CG", actorId: "ACT-CG", device: { deviceId: "DEV-CG", installationId: "INST-CG", networkScopeId: "NET-CG", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-CG", boundary: { serviceId: "SVC-CG", listenScope: "LOOPBACK_ONLY", authenticatedDevice: true, internetExposed: false } } as LocalRuntimeRequest;

function envelopeFor(index: number) {
  const entry = getLocalRuntimeFailureMatrix()[index];
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: `E-CG-${index}`, failureId: `F-CG-${index}`, failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T03:30:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: `O-CG-${index}`, evidence });
  const certification = certifyLocalRuntimeFailure({ certificationId: `C-CG-${index}`, evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: `D-CG-${index}`, evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: `J-CG-${index}`, scenario: entry.scenario, evidence, certification, disposition });
  return certifyLocalRuntimeSafetyEnvelope({ envelopeId: `ENV-CG-${index}`, journey, certification, disposition });
}

test("P13.12361-12480: continuity gate maps recovery policy without bypassing safety", () => {
  const expected = ["READY_FOR_CORRECTION_RETRY", "READY_FOR_REAUTHENTICATION_RETRY", "READY_FOR_SCOPE_REOPEN_RETRY", "OPERATOR_REVIEW_REQUIRED", "RECONCILIATION_REQUIRED"];
  for (let i = 0; i < 5; i += 1) {
    const decision = assessLocalRuntimeRecoveryContinuity(envelopeFor(i));
    assert.equal(decision.state, expected[i]);
    assertLocalRuntimeRecoveryContinuityDecision(decision);
  }
});

test("P13.12361-12480: operator review and reconciliation remain blocked", () => {
  for (const index of [3, 4]) {
    const decision = assessLocalRuntimeRecoveryContinuity(envelopeFor(index));
    assert.equal(decision.admitted, false);
  }
});
