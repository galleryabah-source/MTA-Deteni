import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeFailureObservation, assertFailureObservationMatchesEvidence } from "../src/application/local-runtime-failure-observability.js";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-O", runtimeMode: "LAN", deviceClass: "SMARTPHONE", networkScopeId: "NET-O", certificationJourneyId: "J-O", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-O", executionId: "EXEC-O", deviceId: "DEV-O", installationId: "INST-O", networkScopeId: "NET-O", runtimeMode: "LAN", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-O", actorId: "ACT-O", device: { deviceId: "DEV-O", installationId: "INST-O", networkScopeId: "NET-O", deviceClass: "SMARTPHONE" }, method: "POST", path: "/mta-local/mutation", idempotencyKey: "IDEMP-O", headers: {}, bodyHash: "BODY-O", boundary: { serviceId: "SVC-O", listenScope: "LAN_ONLY", requiresAuthenticatedDevice: true, allowsInternetExposure: false } } as LocalRuntimeRequest;

test("P13.11401-11520: failure observation mirrors evidence", () => {
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: "E-O", failureId: "FAIL-O", failureClass: "REQUEST_REJECTED", request, response: { requestId: "REQ-O", status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T01:10:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: "OBS-O", evidence });
  assert.doesNotThrow(() => assertFailureObservationMatchesEvidence(observation, evidence));
  assert.throws(() => assertFailureObservationMatchesEvidence({ ...observation, sessionId: "S-X" }, evidence), /drift/i);
});
