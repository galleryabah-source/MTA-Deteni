import assert from "node:assert/strict";
import test from "node:test";
import { getLocalRuntimeFailureMatrix } from "../src/application/local-runtime-failure-recovery-matrix.js";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import { createLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import { certifyLocalRuntimeFailureRecoveryJourney } from "../src/application/local-runtime-failure-recovery-journey.js";
import { certifyLocalRuntimeSafetyEnvelope } from "../src/application/local-runtime-safety-certification.js";
import { createLocalRuntimeRecoveryDecision, assertLocalRuntimeRecoveryDecisionIntegrity } from "../src/application/local-runtime-recovery-decision-integrity.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-DI", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-DI", certificationJourneyId: "J-DI", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-DI", executionId: "EXEC-DI", deviceId: "DEV-DI", installationId: "INST-DI", networkScopeId: "NET-DI", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-DI", actorId: "ACT-DI", device: { deviceId: "DEV-DI", installationId: "INST-DI", networkScopeId: "NET-DI", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-DI", boundary: { serviceId: "SVC-DI", listenScope: "LOOPBACK_ONLY", authenticatedDevice: true, internetExposed: false } } as LocalRuntimeRequest;

function makeEnvelope(index: number) {
  const entry = getLocalRuntimeFailureMatrix()[index];
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: `E-DI-${index}`, failureId: `F-DI-${index}`, failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T03:50:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: `O-DI-${index}`, evidence });
  const failure = certifyLocalRuntimeFailure({ certificationId: `C-DI-${index}`, evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: `D-DI-${index}`, evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: `J-DI-${index}`, scenario: entry.scenario, evidence, certification: failure, disposition });
  return certifyLocalRuntimeSafetyEnvelope({ envelopeId: `ENV-DI-${index}`, journey, certification: failure, disposition });
}

test("P13.12601-12720: decision integrity binds all recovery identities", () => {
  for (let i = 0; i < 5; i += 1) {
    const envelope = makeEnvelope(i);
    const decision = createLocalRuntimeRecoveryDecision({ decisionId: `DEC-DI-${i}`, envelope });
    assertLocalRuntimeRecoveryDecisionIntegrity(decision, envelope);
    assert.equal(decision.syntheticOnly, true);
    assert.equal(decision.envelopeId, envelope.envelopeId);
    assert.equal(decision.journeyId, envelope.journeyId);
    assert.equal(decision.certificationId, envelope.certificationId);
    assert.equal(decision.evidenceId, envelope.evidenceId);
    assert.equal(decision.dispositionId, envelope.dispositionId);
  }
});

test("P13.12601-12720: stale, cross-scenario and tampered decisions fail closed", () => {
  const first = makeEnvelope(0);
  const second = makeEnvelope(1);
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-DRIFT", envelope: first });
  assert.throws(() => assertLocalRuntimeRecoveryDecisionIntegrity({ ...decision, scenario: second.scenario }, first), /integrity drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionIntegrity(decision, second), /integrity drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionIntegrity({ ...decision, syntheticOnly: false }, first), /synthetic-only/i);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionIntegrity({ ...decision, continuityState: "RECONCILIATION_REQUIRED", admitted: true }, first), /integrity drift|cannot be admitted/i);
});
