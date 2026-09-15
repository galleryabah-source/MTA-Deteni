import type { LocalRuntimeFailureEvidence } from "./local-runtime-failure-evidence.js";
import { assertLocalRuntimeFailureEvidence } from "./local-runtime-failure-evidence.js";

export type LocalRuntimeFailureObservation = Readonly<{
  observationId: string;
  evidenceId: string;
  eventType: "LOCAL_ADAPTER_FAILURE";
  failureId: string;
  failureClass: LocalRuntimeFailureEvidence["failureClass"];
  requestId: string;
  actorId: string;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  observedAt: string;
  syntheticOnly: true;
}>;

export function createLocalRuntimeFailureObservation(input: { observationId: string; evidence: LocalRuntimeFailureEvidence }): LocalRuntimeFailureObservation {
  if (!input.observationId.trim()) throw new Error("Local runtime failure observation identity is required.");
  assertLocalRuntimeFailureEvidence(input.evidence);
  return Object.freeze({ observationId: input.observationId, evidenceId: input.evidence.evidenceId, eventType: "LOCAL_ADAPTER_FAILURE", failureId: input.evidence.failureId, failureClass: input.evidence.failureClass, requestId: input.evidence.requestId, actorId: input.evidence.actorId, sessionId: input.evidence.sessionId, executionId: input.evidence.executionId, deviceId: input.evidence.deviceId, installationId: input.evidence.installationId, networkScopeId: input.evidence.networkScopeId, observedAt: input.evidence.observedAt, syntheticOnly: true });
}

export function assertLocalRuntimeFailureObservation(observation: LocalRuntimeFailureObservation): void {
  for (const [name, value] of Object.entries(observation)) if (name !== "syntheticOnly" && typeof value === "string" && !value.trim()) throw new Error(`Local runtime failure observation requires ${name}.`);
  if (!observation.syntheticOnly) throw new Error("Local runtime failure observation must be synthetic-only.");
  if (observation.eventType !== "LOCAL_ADAPTER_FAILURE") throw new Error("Unsupported local runtime failure event type.");
}

export function assertFailureObservationMatchesEvidence(observation: LocalRuntimeFailureObservation, evidence: LocalRuntimeFailureEvidence): void {
  assertLocalRuntimeFailureObservation(observation);
  const keys: readonly (keyof LocalRuntimeFailureObservation)[] = ["evidenceId", "failureId", "failureClass", "requestId", "actorId", "sessionId", "executionId", "deviceId", "installationId", "networkScopeId", "observedAt"];
  for (const key of keys) if (observation[key] !== evidence[key as keyof LocalRuntimeFailureEvidence]) throw new Error(`Local runtime failure observation drift on ${String(key)}.`);
}
