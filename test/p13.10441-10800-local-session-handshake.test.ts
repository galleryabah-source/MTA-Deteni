import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeSessionHandshake, assertLocalRuntimeSessionHandshake, assertContinuitySensitiveMutationAdmission } from "../src/application/local-runtime-session-handshake.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";
import type { LocalRuntimeRequest } from "../src/application/local-runtime-adapter.js";

test("P13.10441-10800: handshake binds exact session/device/install/network and expires", () => {
  const context = { executionId: "EXEC-1", runtimeMode: "LAN", deviceClass: "TABLET", networkScopeId: "NET-1", certificationJourneyId: "J-1", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
  const session = { sessionId: "S-1", executionId: "EXEC-1", deviceId: "DEV-1", installationId: "INST-1", networkScopeId: "NET-1", runtimeMode: "LAN", state: "RECONCILIATION_REQUIRED", syntheticOnly: true } as OperationalSession;
  const handshake = createLocalRuntimeSessionHandshake({ handshakeId: "H-1", session, context, deviceId: "DEV-1", installationId: "INST-1", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: true });
  assertLocalRuntimeSessionHandshake(handshake, "2026-09-16T00:30:00Z");
  assert.throws(() => assertLocalRuntimeSessionHandshake(handshake, "2026-09-16T01:00:00Z"), /expired/i);
  assert.throws(() => createLocalRuntimeSessionHandshake({ handshakeId: "H-2", session, context, deviceId: "DEV-X", installationId: "INST-1", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: true }), /device scope drift/i);
});

test("P13.10441-10800: continuity-sensitive mutation requires handoff and recovery readiness", () => {
  const context = { executionId: "EXEC-2", runtimeMode: "LAN", deviceClass: "SMARTPHONE", networkScopeId: "NET-2", certificationJourneyId: "J-2", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
  const session = { sessionId: "S-2", executionId: "EXEC-2", deviceId: "DEV-2", installationId: "INST-2", networkScopeId: "NET-2", runtimeMode: "LAN", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
  const handshake = createLocalRuntimeSessionHandshake({ handshakeId: "H-2", session, context, deviceId: "DEV-2", installationId: "INST-2", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: true });
  const request = { requestId: "REQ-2", method: "POST", path: "/mta-local/mutation", headers: {}, bodyHash: "BODY-2", idempotencyKey: "IDEMP-2", device: { deviceId: "DEV-2", installationId: "INST-2", networkScopeId: "NET-2", deviceClass: "SMARTPHONE" }, boundary: { serviceId: "SERVICE-2", listenScope: "LAN_ONLY", authenticatedDevice: true, internetExposed: false } } as LocalRuntimeRequest;
  assert.throws(() => assertContinuitySensitiveMutationAdmission({ handshake, session, context, request, now: "2026-09-16T00:10:00Z", handoffCertified: false, recoveryProofReady: true }), /certified handoff/i);
  assert.throws(() => assertContinuitySensitiveMutationAdmission({ handshake, session, context, request, now: "2026-09-16T00:10:00Z", handoffCertified: true, recoveryProofReady: false }), /ready recovery/i);
  assert.doesNotThrow(() => assertContinuitySensitiveMutationAdmission({ handshake, session, context, request, now: "2026-09-16T00:10:00Z", handoffCertified: true, recoveryProofReady: true }));
});
