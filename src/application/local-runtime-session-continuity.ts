import type { OperationalSession } from "./offline-operational-session.js";
import type { LocalRuntimeSessionHandshake } from "./local-runtime-session-handshake.js";
import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";
import { assertSessionScope } from "./offline-operational-session.js";
import { assertLocalRuntimeSessionHandshake } from "./local-runtime-session-handshake.js";

export type SessionContinuityDecision = "READY" | "RECONCILIATION_REQUIRED" | "BLOCKED";

export type SessionContinuityProof = Readonly<{
  proofId: string;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  fromState: OperationalSession["state"];
  toState: OperationalSession["state"];
  decision: SessionContinuityDecision;
  handshakeId: string;
  syntheticOnly: true;
}>;

export function assessSessionContinuity(input: { proofId: string; session: OperationalSession; handshake: LocalRuntimeSessionHandshake; context: RuntimeExecutionContext; now: string }): SessionContinuityProof {
  if (!input.proofId.trim()) throw new Error("Session continuity proof identity is required.");
  assertLocalRuntimeSessionHandshake(input.handshake, input.now);
  assertSessionScope(input.session, input.context, input.handshake.deviceId, input.handshake.installationId);
  if (input.handshake.sessionId !== input.session.sessionId || input.handshake.executionId !== input.session.executionId || input.handshake.networkScopeId !== input.session.networkScopeId) throw new Error("Session continuity handshake binding mismatch.");
  if (input.session.state === "CLOSED" || input.session.state === "INTERRUPTED") return Object.freeze({ proofId: input.proofId, sessionId: input.session.sessionId, executionId: input.session.executionId, deviceId: input.session.deviceId, installationId: input.session.installationId, networkScopeId: input.session.networkScopeId, fromState: input.session.state, toState: input.session.state, decision: "BLOCKED", handshakeId: input.handshake.handshakeId, syntheticOnly: true });
  const decision: SessionContinuityDecision = input.session.state === "RECONCILIATION_REQUIRED" || input.handshake.recoveryRequired ? "RECONCILIATION_REQUIRED" : "READY";
  return Object.freeze({ proofId: input.proofId, sessionId: input.session.sessionId, executionId: input.session.executionId, deviceId: input.session.deviceId, installationId: input.session.installationId, networkScopeId: input.session.networkScopeId, fromState: input.session.state, toState: input.session.state, decision, handshakeId: input.handshake.handshakeId, syntheticOnly: true });
}

export function assertSessionContinuityProof(proof: SessionContinuityProof): void {
  for (const value of [proof.proofId, proof.sessionId, proof.executionId, proof.deviceId, proof.installationId, proof.networkScopeId, proof.handshakeId]) if (!value.trim()) throw new Error("Session continuity proof identity is required.");
  if (!proof.syntheticOnly) throw new Error("Session continuity proof must be synthetic-only.");
  if (proof.decision === "BLOCKED") throw new Error("Session continuity proof is blocked.");
  if (proof.fromState !== proof.toState) throw new Error("Session continuity proof state transition is not deterministic.");
}

export function assertHandshakeReusableForSession(input: { session: OperationalSession; handshake: LocalRuntimeSessionHandshake; context: RuntimeExecutionContext; now: string }): void {
  assertLocalRuntimeSessionHandshake(input.handshake, input.now);
  assertSessionScope(input.session, input.context, input.handshake.deviceId, input.handshake.installationId);
  if (input.session.state === "CLOSED" || input.session.state === "INTERRUPTED") throw new Error("Closed or interrupted session cannot reuse a local runtime handshake.");
  if (input.handshake.sessionId !== input.session.sessionId || input.handshake.executionId !== input.session.executionId) throw new Error("Handshake/session identity continuity mismatch.");
}
