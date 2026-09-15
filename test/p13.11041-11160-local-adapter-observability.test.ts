import assert from "node:assert/strict";
import test from "node:test";
import { MemoryLocalRuntimeAdapter, type LocalRuntimeRequest } from "../src/application/local-runtime-adapter.js";
import { createLocalRuntimeSessionHandshake } from "../src/application/local-runtime-session-handshake.js";
import { executeLocalRuntimeWithAudit } from "../src/application/local-runtime-audit-envelope.js";
import { assertLocalRuntimeObservation, assertObservationMatchesAudit, createLocalRuntimeObservation } from "../src/application/local-runtime-observability.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

test("P13.11041-11160: observation is deterministically derived from audit evidence", async () => {
  const context = { executionId: "EXEC-OBS-1", runtimeMode: "LOCAL", deviceClass: "SMARTPHONE", networkScopeId: "NET-OBS-1", certificationJourneyId: "J-OBS-1", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
  const session = { sessionId: "SESSION-OBS-1", executionId: "EXEC-OBS-1", deviceId: "DEVICE-OBS-1", installationId: "INSTALL-OBS-1", networkScopeId: "NET-OBS-1", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
  const handshake = createLocalRuntimeSessionHandshake({ handshakeId: "HANDSHAKE-OBS-1", session, context, deviceId: "DEVICE-OBS-1", installationId: "INSTALL-OBS-1", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: false });
  const request = { requestId: "REQ-OBS-1", actorId: "ACTOR-OBS-1", method: "GET", path: "/mta-local/status", device: { deviceId: "DEVICE-OBS-1", installationId: "INSTALL-OBS-1", networkScopeId: "NET-OBS-1", deviceClass: "SMARTPHONE" }, boundary: { serviceId: "SERVICE-OBS-1", listenScope: "LOOPBACK_ONLY", requiresAuthenticatedDevice: true, allowsInternetExposure: false } } as LocalRuntimeRequest;
  const result = await executeLocalRuntimeWithAudit({ evidenceId: "EVIDENCE-OBS-1", request, session, handshake, context, observedAt: "2026-09-16T00:10:00Z", adapter: new MemoryLocalRuntimeAdapter() });
  const observation = createLocalRuntimeObservation({ observationId: "OBSERVATION-1", audit: result.audit });
  assertLocalRuntimeObservation(observation);
  assertObservationMatchesAudit(observation, result.audit);
  assert.equal(observation.eventType, "LOCAL_ADAPTER_EXECUTION");
});

test("P13.11041-11160: observation drift fails closed", () => {
  const audit = { evidenceId: "E", requestId: "R", responseRequestId: "R", actorId: "A", sessionId: "S", executionId: "X", deviceId: "D", installationId: "I", networkScopeId: "N", method: "GET", path: "/mta-local/x", outcome: "ACCEPTED", status: "ACCEPTED", observedAt: "2026-09-16T00:00:00Z", syntheticOnly: true } as const;
  const observation = { observationId: "O", evidenceId: "E", eventType: "LOCAL_ADAPTER_EXECUTION", actorId: "A-DRIFT", sessionId: "S", executionId: "X", deviceId: "D", installationId: "I", networkScopeId: "N", requestId: "R", method: "GET", path: "/mta-local/x", outcome: "ACCEPTED", observedAt: "2026-09-16T00:00:00Z", syntheticOnly: true } as const;
  assert.throws(() => assertObservationMatchesAudit(observation, audit), /drift/i);
});
