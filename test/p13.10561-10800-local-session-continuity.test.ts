import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeSessionHandshake, assertLocalRuntimeSessionHandshake } from "../src/application/local-runtime-session-handshake.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

test("P13.10561-10680: handshake cannot outlive its declared session window", () => {
  const context = { executionId: "EXEC-3", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "LOOP-1", certificationJourneyId: "J-3", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
  const session = { sessionId: "S-3", executionId: "EXEC-3", deviceId: "DEV-3", installationId: "INST-3", networkScopeId: "LOOP-1", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
  const handshake = createLocalRuntimeSessionHandshake({ handshakeId: "H-3", session, context, deviceId: "DEV-3", installationId: "INST-3", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T00:05:00Z", continuitySensitive: false });
  assert.doesNotThrow(() => assertLocalRuntimeSessionHandshake(handshake, "2026-09-16T00:04:59Z"));
  assert.throws(() => assertLocalRuntimeSessionHandshake(handshake, "2026-09-16T00:05:00Z"), /expired/i);
});

test("P13.10681-10800: malformed handshake time and identity fail closed", () => {
  const context = { executionId: "EXEC-4", runtimeMode: "LAN", deviceClass: "TABLET", networkScopeId: "NET-4", certificationJourneyId: "J-4", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
  const session = { sessionId: "S-4", executionId: "EXEC-4", deviceId: "DEV-4", installationId: "INST-4", networkScopeId: "NET-4", runtimeMode: "LAN", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
  assert.throws(() => createLocalRuntimeSessionHandshake({ handshakeId: "H-4", session, context, deviceId: "DEV-4", installationId: "INST-4", issuedAt: "bad", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: false }), /expiry/i);
  const valid = createLocalRuntimeSessionHandshake({ handshakeId: "H-4B", session, context, deviceId: "DEV-4", installationId: "INST-4", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: false });
  assert.throws(() => assertLocalRuntimeSessionHandshake({ ...valid, deviceId: "DEV-OTHER" }, "2026-09-16T00:10:00Z"), /identity/i);
});
