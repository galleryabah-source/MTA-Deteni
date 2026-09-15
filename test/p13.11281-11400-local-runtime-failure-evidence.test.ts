import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeFailureEvidence, assertFailureEvidenceBoundary } from "../src/application/local-runtime-failure-evidence.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-F", runtimeMode: "LAN", deviceClass: "TABLET", networkScopeId: "NET-F", certificationJourneyId: "J-F", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-F", executionId: "EXEC-F", deviceId: "DEV-F", installationId: "INST-F", networkScopeId: "NET-F", runtimeMode: "LAN", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-F", actorId: "ACT-F", device: { deviceId: "DEV-F", installationId: "INST-F", networkScopeId: "NET-F", deviceClass: "TABLET" }, method: "POST", path: "/mta-local/mutation", idempotencyKey: "IDEMP-F", headers: {}, bodyHash: "BODY-F", boundary: { serviceId: "SVC-F", listenScope: "LAN_ONLY", authenticatedDevice: true, internetExposed: false } } as LocalRuntimeRequest;
const response = { requestId: "REQ-F", status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse;

test("P13.11281-11400: failure evidence binds request/session scope", () => {
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: "E-F", failureId: "FAIL-F", failureClass: "REQUEST_REJECTED", request, response, session, context, observedAt: "2026-09-16T01:00:00Z" });
  assert.doesNotThrow(() => assertFailureEvidenceBoundary({ evidence, request }));
  assert.throws(() => assertFailureEvidenceBoundary({ evidence: { ...evidence, deviceId: "DEV-X" }, request }), /requires deviceId|scope drift|identity/i);
});

test("P13.11281-11400: request/response drift fails closed", () => {
  assert.throws(() => createLocalRuntimeFailureEvidence({ evidenceId: "E-X", failureId: "FAIL-X", failureClass: "REQUEST_REJECTED", request, response: { ...response, requestId: "REQ-X" }, session, context, observedAt: "2026-09-16T01:00:00Z" }), /request\/response identity drift/i);
});
