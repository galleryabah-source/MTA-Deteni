import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeSessionHandshake } from "../src/application/local-runtime-session-handshake.js";
import { assessSessionContinuity, assertSessionContinuityProof, assertHandshakeReusableForSession } from "../src/application/local-runtime-session-continuity.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-5", runtimeMode: "LAN", deviceClass: "TABLET", networkScopeId: "NET-5", certificationJourneyId: "J-5", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;

function session(state: OperationalSession["state"]): OperationalSession {
  return { sessionId: "S-5", executionId: "EXEC-5", deviceId: "DEV-5", installationId: "INST-5", networkScopeId: "NET-5", runtimeMode: "LAN", state, syntheticOnly: true };
}

test("P13.10801-10920: active session can reuse a valid bound handshake", () => {
  const current = session("ACTIVE");
  const handshake = createLocalRuntimeSessionHandshake({ handshakeId: "H-5", session: current, context, deviceId: "DEV-5", installationId: "INST-5", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: false });
  assert.doesNotThrow(() => assertHandshakeReusableForSession({ session: current, handshake, context, now: "2026-09-16T00:30:00Z" }));
  const proof = assessSessionContinuity({ proofId: "P-5", session: current, handshake, context, now: "2026-09-16T00:30:00Z" });
  assertSessionContinuityProof(proof);
  assert.equal(proof.decision, "READY");
});

test("P13.10801-10920: closed/interrupted sessions cannot reuse a valid-looking handshake", () => {
  for (const state of ["CLOSED", "INTERRUPTED"] as const) {
    const current = session(state);
    const handshake = createLocalRuntimeSessionHandshake({ handshakeId: `H-${state}`, session: current, context, deviceId: "DEV-5", installationId: "INST-5", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: false });
    assert.throws(() => assertHandshakeReusableForSession({ session: current, handshake, context, now: "2026-09-16T00:30:00Z" }), /cannot reuse/i);
    const proof = assessSessionContinuity({ proofId: `P-${state}`, session: current, handshake, context, now: "2026-09-16T00:30:00Z" });
    assert.equal(proof.decision, "BLOCKED");
    assert.throws(() => assertSessionContinuityProof(proof), /blocked/i);
  }
});

test("P13.10801-10920: reconciliation-required session never becomes READY merely by handshake reuse", () => {
  const current = session("RECONCILIATION_REQUIRED");
  const handshake = createLocalRuntimeSessionHandshake({ handshakeId: "H-REC", session: current, context, deviceId: "DEV-5", installationId: "INST-5", issuedAt: "2026-09-16T00:00:00Z", expiresAt: "2026-09-16T01:00:00Z", continuitySensitive: true });
  const proof = assessSessionContinuity({ proofId: "P-REC", session: current, handshake, context, now: "2026-09-16T00:30:00Z" });
  assertSessionContinuityProof(proof);
  assert.equal(proof.decision, "RECONCILIATION_REQUIRED");
});
