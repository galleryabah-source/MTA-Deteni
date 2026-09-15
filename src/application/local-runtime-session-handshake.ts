import type { OperationalSession } from "./offline-operational-session.js";
import type { RuntimeExecutionContext, RuntimeHandoff } from "./runtime-execution-boundary.js";
import type { LocalRuntimeRequest } from "./local-runtime-adapter.js";
import { assertSessionScope } from "./offline-operational-session.js";
import { assertRuntimeHandoffSafety } from "./runtime-execution-boundary.js";
import { assertLocalRuntimeRequest } from "./local-runtime-adapter.js";

export type LocalRuntimeSessionHandshake = Readonly<{
  handshakeId: string;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  issuedAt: string;
  expiresAt: string;
  continuitySensitive: boolean;
  handoffRequired: boolean;
  recoveryRequired: boolean;
  syntheticOnly: true;
}>;

export function createLocalRuntimeSessionHandshake(input: {
  handshakeId: string;
  session: OperationalSession;
  context: RuntimeExecutionContext;
  deviceId: string;
  installationId: string;
  issuedAt: string;
  expiresAt: string;
  continuitySensitive: boolean;
  handoff?: RuntimeHandoff;
}): LocalRuntimeSessionHandshake {
  assertSessionScope(input.session, input.context, input.deviceId, input.installationId);
  for (const value of [input.handshakeId, input.issuedAt, input.expiresAt]) if (!value.trim()) throw new Error("Local runtime handshake identity is required.");
  if (input.context.runtimeMode !== "LAN" && input.context.runtimeMode !== "LOCAL") throw new Error("Local runtime handshake requires LAN or LOCAL runtime.");
  const issued = Date.parse(input.issuedAt);
  const expires = Date.parse(input.expiresAt);
  if (!Number.isFinite(issued) || !Number.isFinite(expires) || expires <= issued) throw new Error("Local runtime handshake expiry is invalid.");
  if (input.handoff) assertRuntimeHandoffSafety(input.handoff);
  return Object.freeze({
    handshakeId: input.handshakeId,
    sessionId: input.session.sessionId,
    executionId: input.session.executionId,
    deviceId: input.deviceId,
    installationId: input.installationId,
    networkScopeId: input.context.networkScopeId,
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt,
    continuitySensitive: input.continuitySensitive,
    handoffRequired: Boolean(input.handoff),
    recoveryRequired: input.session.state === "RECONCILIATION_REQUIRED" || Boolean(input.handoff?.reconciliationRequired),
    syntheticOnly: true,
  });
}

export function assertLocalRuntimeSessionHandshake(handshake: LocalRuntimeSessionHandshake, now: string): void {
  for (const value of [handshake.handshakeId, handshake.sessionId, handshake.executionId, handshake.deviceId, handshake.installationId, handshake.networkScopeId, handshake.issuedAt, handshake.expiresAt, now]) if (!value.trim()) throw new Error("Local runtime handshake identity is required.");
  if (!handshake.syntheticOnly) throw new Error("Local runtime handshake must be synthetic-only.");
  const issued = Date.parse(handshake.issuedAt);
  const expires = Date.parse(handshake.expiresAt);
  const current = Date.parse(now);
  if (![issued, expires, current].every(Number.isFinite) || expires <= issued) throw new Error("Local runtime handshake time window is invalid.");
  if (current < issued || current >= expires) throw new Error("Local runtime handshake has expired or is not yet valid.");
}

export function assertHandshakeRequest(input: { handshake: LocalRuntimeSessionHandshake; request: LocalRuntimeRequest; now: string }): void {
  assertLocalRuntimeSessionHandshake(input.handshake, input.now);
  assertLocalRuntimeRequest(input.request);
  if (input.request.device.deviceId !== input.handshake.deviceId || input.request.device.installationId !== input.handshake.installationId || input.request.device.networkScopeId !== input.handshake.networkScopeId) throw new Error("Local runtime handshake device/install/network binding mismatch.");
  if (input.request.device.deviceClass === undefined) throw new Error("Local runtime handshake requires a device class.");
}

export function assertContinuitySensitiveMutationAdmission(input: { handshake: LocalRuntimeSessionHandshake; session: OperationalSession; context: RuntimeExecutionContext; request: LocalRuntimeRequest; now: string; handoffCertified: boolean; recoveryProofReady: boolean }): void {
  assertHandshakeRequest({ handshake: input.handshake, request: input.request, now: input.now });
  assertSessionScope(input.session, input.context, input.handshake.deviceId, input.handshake.installationId);
  if (input.session.sessionId !== input.handshake.sessionId || input.session.executionId !== input.handshake.executionId) throw new Error("Local runtime handshake session binding mismatch.");
  if (input.handshake.continuitySensitive && (!input.handoffCertified || !input.recoveryProofReady)) throw new Error("Continuity-sensitive mutation requires certified handoff and ready recovery proof.");
}
