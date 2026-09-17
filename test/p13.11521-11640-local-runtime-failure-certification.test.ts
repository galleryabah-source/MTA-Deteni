import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-C", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-C", certificationJourneyId: "J-C", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-C", executionId: "EXEC-C", deviceId: "DEV-C", installationId: "INST-C", networkScopeId: "NET-C", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-C", actorId: "ACT-C", device: { deviceId: "DEV-C", installationId: "INST-C", networkScopeId: "NET-C", deviceClass: "DESKTOP" }, method: "GET", path: "/mta-local/status", headers: {}, boundary: { serviceId: "SVC-C", listenScope: "LOOPBACK_ONLY", requiresAuthenticatedDevice: true, allowsInternetExposure: false } } as LocalRuntimeRequest;

test("P13.11521-11640: failure evidence and observation certify as one synthetic chain", () => {
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: "E-C", failureId: "FAIL-C", failureClass: "EXECUTION_REJECTED", request, response: { requestId: "REQ-C", status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T01:20:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: "OBS-C", evidence });
  const certification = certifyLocalRuntimeFailure({ certificationId: "CERT-C", evidence, observation, request });
  assert.equal(certification.certified, true);
  assert.equal(certification.syntheticOnly, true);
  assert.equal(certification.evidenceId, evidence.evidenceId);
  assert.equal(certification.observationId, observation.observationId);
});

test("P13.11521-11640: certification rejects evidence identity drift", () => {
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: "E-D", failureId: "FAIL-D", failureClass: "REQUEST_REJECTED", request, response: { requestId: "REQ-C", status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T01:20:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: "OBS-D", evidence });
  assert.throws(() => certifyLocalRuntimeFailure({ certificationId: "CERT-D", evidence: { ...evidence, requestId: "REQ-X" }, observation, request }), /identity drift|request\/response|requires/i);
});
