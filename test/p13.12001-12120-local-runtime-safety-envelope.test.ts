import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import { createLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import { certifyLocalRuntimeFailureRecoveryJourney } from "../src/application/local-runtime-failure-recovery-journey.js";
import { assertLocalRuntimeSafetyEnvelope, certifyLocalRuntimeSafetyEnvelope } from "../src/application/local-runtime-safety-certification.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-S", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-S", certificationJourneyId: "J-S", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-S", executionId: "EXEC-S", deviceId: "DEV-S", installationId: "INST-S", networkScopeId: "NET-S", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-S", actorId: "ACT-S", device: { deviceId: "DEV-S", installationId: "INST-S", networkScopeId: "NET-S", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-S", boundary: { serviceId: "SVC-S", listenScope: "LOOPBACK_ONLY", allowsInternetExposure: false, requiresAuthenticatedDevice: true } } as LocalRuntimeRequest;

test("P13.12001-12120: safety envelope binds certified failure, recovery and retry policy", () => {
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: "E-S", failureId: "FAIL-S", failureClass: "EXECUTION_REJECTED", request, response: { requestId: "REQ-S", status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T02:40:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: "OBS-S", evidence });
  const certification = certifyLocalRuntimeFailure({ certificationId: "CERT-S", evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: "DISP-S", evidence, scenario: "IDEMPOTENCY_CONFLICT" });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: "JOURNEY-S", scenario: "IDEMPOTENCY_CONFLICT", evidence, certification, disposition });
  const envelope = certifyLocalRuntimeSafetyEnvelope({ envelopeId: "ENV-S", journey, certification, disposition });
  assert.equal(envelope.certified, true);
  assert.equal(envelope.syntheticOnly, true);
  assert.equal(envelope.safeToRetry, false);
  assert.equal(envelope.operatorReviewRequired, true);
  assertLocalRuntimeSafetyEnvelope(envelope);
});