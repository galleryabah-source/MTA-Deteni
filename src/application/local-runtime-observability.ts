import type { LocalRuntimeAuditEnvelope } from "./local-runtime-audit-envelope.js";

export type LocalRuntimeObservation = Readonly<{
  observationId: string;
  evidenceId: string;
  eventType: "LOCAL_ADAPTER_EXECUTION";
  actorId: string;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  requestId: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  outcome: "ACCEPTED" | "REJECTED";
  observedAt: string;
  syntheticOnly: true;
}>;

export function createLocalRuntimeObservation(input: { observationId: string; audit: LocalRuntimeAuditEnvelope }): LocalRuntimeObservation {
  if (!input.observationId.trim()) throw new Error("Local adapter observation identity is required.");
  return Object.freeze({
    observationId: input.observationId,
    evidenceId: input.audit.evidenceId,
    eventType: "LOCAL_ADAPTER_EXECUTION",
    actorId: input.audit.actorId,
    sessionId: input.audit.sessionId,
    executionId: input.audit.executionId,
    deviceId: input.audit.deviceId,
    installationId: input.audit.installationId,
    networkScopeId: input.audit.networkScopeId,
    requestId: input.audit.requestId,
    method: input.audit.method,
    path: input.audit.path,
    outcome: input.audit.outcome,
    observedAt: input.audit.observedAt,
    syntheticOnly: true,
  });
}

export function assertLocalRuntimeObservation(observation: LocalRuntimeObservation): void {
  for (const [name, value] of Object.entries(observation)) {
    if (name === "syntheticOnly") continue;
    if (typeof value === "string" && !value.trim()) throw new Error(`Local adapter observation requires ${name}.`);
  }
  if (!observation.syntheticOnly) throw new Error("Local adapter observation must be synthetic-only.");
  if (observation.eventType !== "LOCAL_ADAPTER_EXECUTION") throw new Error("Unsupported local adapter observation event type.");
}

export function assertObservationMatchesAudit(observation: LocalRuntimeObservation, audit: LocalRuntimeAuditEnvelope): void {
  const keys: readonly (keyof LocalRuntimeObservation)[] = ["evidenceId", "actorId", "sessionId", "executionId", "deviceId", "installationId", "networkScopeId", "requestId", "method", "path", "outcome", "observedAt"];
  for (const key of keys) {
    const auditKey = key as keyof LocalRuntimeAuditEnvelope;
    if (observation[key] !== audit[auditKey]) throw new Error(`Local adapter observation drift on ${String(key)}.`);
  }
}
