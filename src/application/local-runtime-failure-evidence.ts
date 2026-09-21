import type { LocalRuntimeRequest, LocalRuntimeResponse } from "./local-runtime-adapter.js";
import type { LocalRuntimeAuditEnvelope } from "./local-runtime-audit-envelope.js";
import type { LocalRuntimeSessionHandshake } from "./local-runtime-session-handshake.js";
import type { OperationalSession } from "./offline-operational-session.js";
import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";
import { assertLocalRuntimeRequest } from "./local-runtime-adapter.js";
import { assertLocalRuntimeAuditEnvelope } from "./local-runtime-audit-envelope.js";
import { assertLocalRuntimeSessionHandshake } from "./local-runtime-session-handshake.js";

export type LocalRuntimeFailureClass = "REQUEST_REJECTED" | "HANDSHAKE_REJECTED" | "SESSION_SCOPE_REJECTED" | "EXECUTION_REJECTED";

export type LocalRuntimeFailureEvidence = Readonly<{
  evidenceId: string;
  failureId: string;
  failureClass: LocalRuntimeFailureClass;
  requestId: string;
  actorId: string;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  method: LocalRuntimeRequest["method"];
  path: string;
  idempotencyKey?: string;
  responseStatus: LocalRuntimeResponse["status"];
  observedAt: string;
  syntheticOnly: true;
}>;

export function createLocalRuntimeFailureEvidence(input: {
  evidenceId: string;
  failureId: string;
  failureClass: LocalRuntimeFailureClass;
  request: LocalRuntimeRequest;
  response: LocalRuntimeResponse;
  session: OperationalSession;
  context: RuntimeExecutionContext;
  handshake?: LocalRuntimeSessionHandshake;
  observedAt: string;
}): LocalRuntimeFailureEvidence {
  for (const value of [input.evidenceId, input.failureId, input.observedAt, input.request.requestId, input.request.actorId, input.session.sessionId, input.context.executionId, input.request.device.deviceId, input.request.device.installationId, input.request.device.networkScopeId]) if (!value.trim()) throw new Error("Local runtime failure evidence identity is required.");
  if (!input.response.syntheticOnly) throw new Error("Local runtime failure response must be synthetic-only.");
  if (input.response.requestId !== input.request.requestId) throw new Error("Local runtime failure request/response identity drift.");
  if (input.session.executionId !== input.context.executionId) throw new Error("Local runtime failure execution identity drift.");
  if (input.request.device.deviceId !== input.session.deviceId || input.request.device.installationId !== input.session.installationId || input.request.device.networkScopeId !== input.session.networkScopeId) throw new Error("Local runtime failure device scope drift.");
  if (input.handshake) {
    assertLocalRuntimeSessionHandshake(input.handshake, input.observedAt);
    if (input.handshake.sessionId !== input.session.sessionId || input.handshake.executionId !== input.context.executionId || input.handshake.deviceId !== input.session.deviceId || input.handshake.installationId !== input.session.installationId || input.handshake.networkScopeId !== input.session.networkScopeId) throw new Error("Local runtime failure handshake identity drift.");
  }
  return Object.freeze({ evidenceId: input.evidenceId, failureId: input.failureId, failureClass: input.failureClass, requestId: input.request.requestId, actorId: input.request.actorId, sessionId: input.session.sessionId, executionId: input.context.executionId, deviceId: input.session.deviceId, installationId: input.session.installationId, networkScopeId: input.session.networkScopeId, method: input.request.method, path: input.request.path, ...(input.request.idempotencyKey ? { idempotencyKey: input.request.idempotencyKey } : {}), responseStatus: input.response.status, observedAt: input.observedAt, syntheticOnly: true });
}

export function assertLocalRuntimeFailureEvidence(evidence: LocalRuntimeFailureEvidence): void {
  for (const [name, value] of Object.entries(evidence)) if (name !== "syntheticOnly" && typeof value === "string" && !value.trim()) throw new Error(`Local runtime failure evidence requires ${name}.`);
  if (!evidence.syntheticOnly) throw new Error("Local runtime failure evidence must be synthetic-only.");
  if (evidence.method !== "GET" && !evidence.idempotencyKey) throw new Error("Local runtime failure evidence requires mutation idempotency.");
}

export function assertFailureEvidenceBoundary(input: { evidence: LocalRuntimeFailureEvidence; audit?: LocalRuntimeAuditEnvelope | undefined; request: LocalRuntimeRequest }): void {
  assertLocalRuntimeFailureEvidence(input.evidence);
  if (input.audit) {
    assertLocalRuntimeAuditEnvelope(input.audit);
    if (input.evidence.evidenceId !== input.audit.evidenceId || input.evidence.requestId !== input.audit.requestId || input.evidence.actorId !== input.audit.actorId || input.evidence.sessionId !== input.audit.sessionId || input.evidence.executionId !== input.audit.executionId) throw new Error("Local runtime failure/audit evidence identity drift.");
  }
  if (input.evidence.requestId !== input.request.requestId || input.evidence.actorId !== input.request.actorId || input.evidence.deviceId !== input.request.device.deviceId || input.evidence.installationId !== input.request.device.installationId || input.evidence.networkScopeId !== input.request.device.networkScopeId || input.evidence.method !== input.request.method || input.evidence.path !== input.request.path || input.evidence.idempotencyKey !== input.request.idempotencyKey) throw new Error("Local runtime failure request/session scope identity drift.");
  try { assertLocalRuntimeRequest(input.request); } catch { if (input.evidence.failureClass !== "REQUEST_REJECTED") throw new Error("Local runtime failure class does not match rejected request boundary."); }
}
