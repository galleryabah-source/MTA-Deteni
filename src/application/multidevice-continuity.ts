import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";
import type { OperationalSession } from "./offline-operational-session.js";
import { assertSessionScope } from "./offline-operational-session.js";

export type DeviceHandoffDecision = "READY" | "BLOCKED";

export type DeviceHandoffProof = Readonly<{
  sessionId: string;
  executionId: string;
  fromDeviceId: string;
  toDeviceId: string;
  installationId: string;
  networkScopeId: string;
  decision: DeviceHandoffDecision;
  syntheticOnly: true;
}>;

export function assessDeviceHandoff(input: {
  session: OperationalSession;
  context: RuntimeExecutionContext;
  fromDeviceId: string;
  toDeviceId: string;
  installationId: string;
  networkScopeId: string;
  authorized: boolean;
}): DeviceHandoffProof {
  assertSessionScope(input.session, input.context, input.fromDeviceId, input.installationId);
  for (const value of [input.toDeviceId, input.networkScopeId]) if (!value.trim()) throw new Error("Device handoff identity is required.");
  const sameInstallation = input.installationId === input.session.installationId;
  const sameNetwork = input.networkScopeId === input.session.networkScopeId;
  const decision: DeviceHandoffDecision = input.authorized && sameInstallation && sameNetwork ? "READY" : "BLOCKED";
  return Object.freeze({ sessionId: input.session.sessionId, executionId: input.session.executionId, fromDeviceId: input.fromDeviceId, toDeviceId: input.toDeviceId, installationId: input.installationId, networkScopeId: input.networkScopeId, decision, syntheticOnly: true });
}

export function assertDeviceHandoffProof(proof: DeviceHandoffProof): void {
  if (!proof.syntheticOnly || !proof.sessionId.trim() || !proof.executionId.trim()) throw new Error("Device handoff proof is invalid.");
  if (proof.decision === "READY" && (!proof.installationId.trim() || !proof.networkScopeId.trim())) throw new Error("Ready device handoff requires complete scope identity.");
}
