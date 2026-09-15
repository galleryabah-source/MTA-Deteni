import type { LocalRuntimeRequest, LocalRuntimeResponse } from "./local-runtime-adapter.js";
import type { LocalRuntimeSessionHandshake } from "./local-runtime-session-handshake.js";
import type { OperationalSession } from "./offline-operational-session.js";
import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";
import { assertLocalRuntimeRequest, type LocalRuntimeAdapter } from "./local-runtime-adapter.js";
import { assertHandshakeReusableForSession } from "./local-runtime-session-continuity.js";

export type LocalRuntimeAuditOutcome = "ACCEPTED" | "REJECTED";

export type LocalRuntimeAuditEnvelope = Readonly<{
  evidenceId: string;
  requestId: string;
  responseRequestId: string;
  actorId: string;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  method: LocalRuntimeRequest["method"];
  path: string;
  idempotencyKey?: string;
  outcome: LocalRuntimeAuditOutcome;
  status: LocalRuntimeResponse["status"];
  observedAt: string;
  syntheticOnly: true;
}>;

export function createLocalRuntimeAuditEnvelope(input: {
  evidenceId: string;
  request: LocalRuntimeRequest;
  response: LocalRuntimeResponse;
  session: OperationalSession;
  context: RuntimeExecutionContext;
  observedAt: string;
}): LocalRuntimeAuditEnvelope {
  assertLocalRuntimeRequest(input.request);
  if (!input.evidenceId.trim()) throw new Error("Local adapter audit evidence identity is required.");
  if (!input.observedAt.trim()) throw new Error("Local adapter audit observation time is required.");
  if (!input.response.syntheticOnly) throw new Error("Local adapter response must be synthetic-only.");
  if (input.response.requestId !== input.request.requestId) throw new Error("Local adapter audit request/response identity drift.");
  if (input.context.executionId !== input.session.executionId) throw new Error("Local adapter audit execution identity drift.");
  if (input.request.actorId.trim() === "") throw new Error("Local adapter audit actor identity is required.");
  if (input.request.device.deviceId !== input.session.deviceId || input.request.device.installationId !== input.session.installationId || input.request.device.networkScopeId !== input.session.networkScopeId) {
    throw new Error("Local adapter audit device/install/network identity drift.");
  }
  return Object.freeze({
    evidenceId: input.evidenceId,
    requestId: input.request.requestId,
    responseRequestId: input.response.requestId,
    actorId: input.request.actorId,
    sessionId: input.session.sessionId,
    executionId: input.context.executionId,
    deviceId: input.request.device.deviceId,
    installationId: input.request.device.installationId,
    networkScopeId: input.request.device.networkScopeId,
    method: input.request.method,
    path: input.request.path,
    ...(input.request.idempotencyKey ? { idempotencyKey: input.request.idempotencyKey } : {}),
    outcome: input.response.status,
    status: input.response.status,
    observedAt: input.observedAt,
    syntheticOnly: true,
  });
}

export function assertLocalRuntimeAuditEnvelope(envelope: LocalRuntimeAuditEnvelope): void {
  for (const [name, value] of Object.entries(envelope)) {
    if (name === "syntheticOnly") continue;
    if (typeof value === "string" && !value.trim()) throw new Error(`Local adapter audit envelope requires ${name}.`);
  }
  if (!envelope.syntheticOnly) throw new Error("Local adapter audit envelope must be synthetic-only.");
  if (envelope.requestId !== envelope.responseRequestId) throw new Error("Local adapter audit envelope request identity drift.");
  if (envelope.method !== "GET" && !envelope.idempotencyKey) throw new Error("Local adapter audit envelope requires mutation idempotency.");
}

export async function executeLocalRuntimeWithAudit(input: {
  evidenceId: string;
  request: LocalRuntimeRequest;
  session: OperationalSession;
  handshake: LocalRuntimeSessionHandshake;
  context: RuntimeExecutionContext;
  observedAt: string;
  adapter: LocalRuntimeAdapter;
}): Promise<{ response: LocalRuntimeResponse; audit: LocalRuntimeAuditEnvelope }> {
  assertHandshakeReusableForSession({ session: input.session, handshake: input.handshake, context: input.context, now: input.observedAt });
  assertLocalRuntimeRequest(input.request);
  const response = await input.adapter.execute(input.request);
  const audit = createLocalRuntimeAuditEnvelope({
    evidenceId: input.evidenceId,
    request: input.request,
    response,
    session: input.session,
    context: input.context,
    observedAt: input.observedAt,
  });
  assertLocalRuntimeAuditEnvelope(audit);
  return Object.freeze({ response, audit });
}
