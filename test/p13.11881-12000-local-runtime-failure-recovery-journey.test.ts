import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import { createLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import { certifyLocalRuntimeFailureRecoveryJourney } from "../src/application/local-runtime-failure-recovery-journey.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-J", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-J", certificationJourneyId: "J-J", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-J", executionId: "EXEC-J", deviceId: "DEV-J", installationId: "INST-J", networkScopeId: "NET-J", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-J", actorId: "ACT-J", device: { deviceId: "DEV-J", installationId: "INST-J", networkScopeId: "NET-J", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-J", boundary: { serviceId: "SVC-J", listenScope: "LOOPBACK_ONLY", authenticatedDevice: true, internetExposed: false } } as LocalRuntimeRequest;

test("P13.11881-12000: certified failure flows into one deterministic recovery journey", () => {
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: "E-J", failureId: "FAIL-J", failureClass: "EXECUTION_REJECTED", request, response: { requestId: "REQ-J", status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T02:20:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: "OBS-J", evidence });
  const certification = certifyLocalRuntimeFailure({ certificationId: "CERT-J", evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: "DISP-J", evidence, scenario: "IDEMPOTENCY_CONFLICT" });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: "JOURNEY-J", scenario: "IDEMPOTENCY_CONFLICT", evidence, certification, disposition });
  assert.equal(journey.terminal, true);
  assert.equal(journey.retryAllowed, false);
  assert.equal(journey.syntheticOnly, true);
});

test("P13.11881-12000: mismatched scenario fails closed", () => {
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: "E-K", failureId: "FAIL-K", failureClass: "HANDSHAKE_REJECTED", request, response: { requestId: "REQ-J", status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T02:20:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: "OBS-K", evidence });
  const certification = certifyLocalRuntimeFailure({ certificationId: "CERT-K", evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: "DISP-K", evidence, scenario: "EXPIRED_HANDSHAKE" });
  assert.throws(() => certifyLocalRuntimeFailureRecoveryJourney({ journeyId: "JOURNEY-K", scenario: "MALFORMED_REQUEST", evidence, certification, disposition }), /scenario drift|disposition drift/i);
});
