import assert from "node:assert/strict";
import test from "node:test";
import { MemoryLocalRuntimeAdapter, type LocalRuntimeRequest } from "../src/application/local-runtime-adapter.js";
import { createLocalRuntimeSessionHandshake } from "../src/application/local-runtime-session-handshake.js";
import { executeLocalRuntimeWithAudit, assertLocalRuntimeAuditEnvelope } from "../src/application/local-runtime-audit-envelope.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

test("P13.10921-11040: local adapter execution emits bound synthetic audit evidence", async () => {
  const context = { executionId: "EXEC-AUDIT-1", runtimeMode: "LAN", deviceClass: "TABLET", networkScopeId: "NET-AUDIT-1", certificationJourneyId: "J-AUDIT-1", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
  const session = { sessionId: "SESSION-AUDIT-1", executionId: "EXEC-AUDIT-1", deviceId: "DEVICE-AUDIT-1", installationId: "INSTALL-AUDIT-1", networkScopeId: "NET-AUDIT-1", runtimeMode: "LAN", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
  const handshake = createLocalRuntimeSessionHandshake({ handshakeId: "HANDSHAKE-AUDIT-1", session, context, deviceId: "DEVICE-AUDIT-1", installationId: "INSTALL-AUDIT-1", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: false });
  const request = { requestId: "REQ-AUDIT-1", actorId: "ACTOR-AUDIT-1", method: "POST", path: "/mta-local/health", idempotencyKey: "IDEMP-AUDIT-1", device: { deviceId: "DEVICE-AUDIT-1", installationId: "INSTALL-AUDIT-1", networkScopeId: "NET-AUDIT-1", deviceClass: "TABLET" }, boundary: { serviceId: "SERVICE-AUDIT-1", listenScope: "LAN_ONLY", requiresAuthenticatedDevice: true, allowsInternetExposure: false } } as LocalRuntimeRequest;
  const result = await executeLocalRuntimeWithAudit({ evidenceId: "EVIDENCE-AUDIT-1", request, session, handshake, context, observedAt: "2026-09-16T00:10:00Z", adapter: new MemoryLocalRuntimeAdapter() });
  assert.equal(result.response.requestId, request.requestId);
  assert.equal(result.audit.actorId, request.actorId);
  assert.equal(result.audit.sessionId, session.sessionId);
  assert.equal(result.audit.deviceId, request.device.deviceId);
  assert.equal(result.audit.idempotencyKey, request.idempotencyKey);
  assertLocalRuntimeAuditEnvelope(result.audit);
});

test("P13.10921-11040: audit envelope rejects identity drift", () => {
  const envelope = { evidenceId: "E", requestId: "REQ", responseRequestId: "OTHER", actorId: "A", sessionId: "S", executionId: "X", deviceId: "D", installationId: "I", networkScopeId: "N", method: "POST", path: "/mta-local/x", idempotencyKey: "ID", outcome: "ACCEPTED", status: "ACCEPTED", observedAt: "2026-09-16T00:00:00Z", syntheticOnly: true } as const;
  assert.throws(() => assertLocalRuntimeAuditEnvelope(envelope), /identity drift/i);
});
