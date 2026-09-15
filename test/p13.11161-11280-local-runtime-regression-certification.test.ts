import assert from "node:assert/strict";
import test from "node:test";
import { MemoryLocalRuntimeAdapter, type LocalRuntimeRequest } from "../src/application/local-runtime-adapter.js";
import { createLocalRuntimeSessionHandshake } from "../src/application/local-runtime-session-handshake.js";
import { executeLocalRuntimeWithAudit } from "../src/application/local-runtime-audit-envelope.js";
import { createLocalRuntimeObservation } from "../src/application/local-runtime-observability.js";
import { assessSessionContinuity } from "../src/application/local-runtime-session-continuity.js";
import { certifyLocalRuntimeRegression } from "../src/application/local-runtime-regression-certification.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

test("P13.11161-11280: routing, handshake, continuity, audit and observability certify as one synthetic chain", async () => {
  const context = { executionId: "EXEC-CERT-1", runtimeMode: "LAN", deviceClass: "DESKTOP", networkScopeId: "NET-CERT-1", certificationJourneyId: "J-CERT-1", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
  const session = { sessionId: "SESSION-CERT-1", executionId: "EXEC-CERT-1", deviceId: "DEVICE-CERT-1", installationId: "INSTALL-CERT-1", networkScopeId: "NET-CERT-1", runtimeMode: "LAN", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
  const handshake = createLocalRuntimeSessionHandshake({ handshakeId: "HANDSHAKE-CERT-1", session, context, deviceId: "DEVICE-CERT-1", installationId: "INSTALL-CERT-1", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: false });
  const request = { requestId: "REQ-CERT-1", actorId: "ACTOR-CERT-1", method: "POST", path: "/mta-local/command", idempotencyKey: "IDEMP-CERT-1", device: { deviceId: "DEVICE-CERT-1", installationId: "INSTALL-CERT-1", networkScopeId: "NET-CERT-1", deviceClass: "DESKTOP" }, boundary: { serviceId: "SERVICE-CERT-1", listenScope: "LAN_ONLY", requiresAuthenticatedDevice: true, allowsInternetExposure: false } } as LocalRuntimeRequest;
  const execution = await executeLocalRuntimeWithAudit({ evidenceId: "EVIDENCE-CERT-1", request, session, handshake, context, observedAt: "2026-09-16T00:10:00Z", adapter: new MemoryLocalRuntimeAdapter() });
  const observation = createLocalRuntimeObservation({ observationId: "OBS-CERT-1", audit: execution.audit });
  const continuity = assessSessionContinuity({ proofId: "PROOF-CERT-1", session, handshake, context, now: "2026-09-16T00:10:00Z" });
  assert.equal(continuity.decision, "READY");
  const certification = certifyLocalRuntimeRegression({ certificationId: "CERT-CERT-1", audit: execution.audit, observation, handshake, session, context, continuityProof: continuity, now: "2026-09-16T00:10:00Z" });
  assert.equal(certification.certified, true);
  assert.equal(certification.syntheticOnly, true);
});

test("P13.11161-11280: reconciliation-required continuity cannot be certified", () => {
  const context = { executionId: "EXEC-CERT-2", runtimeMode: "LAN", deviceClass: "TABLET", networkScopeId: "NET-CERT-2", certificationJourneyId: "J-CERT-2", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
  const session = { sessionId: "SESSION-CERT-2", executionId: "EXEC-CERT-2", deviceId: "DEVICE-CERT-2", installationId: "INSTALL-CERT-2", networkScopeId: "NET-CERT-2", runtimeMode: "LAN", state: "RECONCILIATION_REQUIRED", syntheticOnly: true } as OperationalSession;
  const handshake = createLocalRuntimeSessionHandshake({ handshakeId: "HANDSHAKE-CERT-2", session, context, deviceId: "DEVICE-CERT-2", installationId: "INSTALL-CERT-2", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: false });
  const request = { requestId: "REQ-CERT-2", actorId: "ACTOR-CERT-2", method: "GET", path: "/mta-local/status", device: { deviceId: "DEVICE-CERT-2", installationId: "INSTALL-CERT-2", networkScopeId: "NET-CERT-2", deviceClass: "TABLET" }, boundary: { serviceId: "SERVICE-CERT-2", listenScope: "LAN_ONLY", requiresAuthenticatedDevice: true, allowsInternetExposure: false } } as LocalRuntimeRequest;
  const audit = { evidenceId: "EVIDENCE-CERT-2", requestId: "REQ-CERT-2", responseRequestId: "REQ-CERT-2", actorId: "ACTOR-CERT-2", sessionId: session.sessionId, executionId: context.executionId, deviceId: session.deviceId, installationId: session.installationId, networkScopeId: session.networkScopeId, method: "GET", path: request.path, outcome: "ACCEPTED", status: "ACCEPTED", observedAt: "2026-09-16T00:10:00Z", syntheticOnly: true } as const;
  const observation = createLocalRuntimeObservation({ observationId: "OBS-CERT-2", audit });
  const continuity = assessSessionContinuity({ proofId: "PROOF-CERT-2", session, handshake, context, now: "2026-09-16T00:10:00Z" });
  assert.equal(continuity.decision, "RECONCILIATION_REQUIRED");
  assert.throws(() => certifyLocalRuntimeRegression({ certificationId: "CERT-CERT-2", audit, observation, handshake, session, context, continuityProof: continuity, now: "2026-09-16T00:10:00Z" }), /READY session continuity/i);
});
