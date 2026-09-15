import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";
import type { OperationalSession } from "./offline-operational-session.js";

export type LocalLanRecoveryDecision = "READY" | "BLOCKED";

export type LocalLanRecoveryProof = Readonly<{
  proofId: string;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  runtimeMode: "LAN" | "LOCAL";
  decision: LocalLanRecoveryDecision;
  syntheticOnly: true;
}>;

export function assessLocalLanRecovery(input: { proofId: string; session: OperationalSession; context: RuntimeExecutionContext; targetDeviceId: string; targetInstallationId: string; targetNetworkScopeId: string; }): LocalLanRecoveryProof {
  const values = [input.proofId, input.session.sessionId, input.session.executionId, input.session.deviceId, input.session.installationId, input.session.networkScopeId, input.targetDeviceId, input.targetInstallationId, input.targetNetworkScopeId];
  if (values.some((value) => !value.trim())) throw new Error("Local/LAN recovery identity is required.");
  if (!input.context.authenticated || !input.context.syntheticOnly) throw new Error("Local/LAN recovery requires authenticated synthetic context.");
  if (input.session.syntheticOnly !== true) throw new Error("Local/LAN recovery requires a synthetic session.");
  if (input.context.runtimeMode !== "LAN" && input.context.runtimeMode !== "LOCAL") throw new Error("Local/LAN recovery requires LAN or LOCAL runtime.");
  if (input.session.executionId !== input.context.executionId || input.session.networkScopeId !== input.context.networkScopeId) throw new Error("Local/LAN recovery source execution/network drift detected.");
  const decision: LocalLanRecoveryDecision = input.targetInstallationId === input.session.installationId && input.targetNetworkScopeId === input.session.networkScopeId ? "READY" : "BLOCKED";
  return Object.freeze({ proofId: input.proofId, sessionId: input.session.sessionId, executionId: input.session.executionId, deviceId: input.targetDeviceId, installationId: input.targetInstallationId, networkScopeId: input.targetNetworkScopeId, runtimeMode: input.context.runtimeMode, decision, syntheticOnly: true });
}

export function assertLocalLanRecoveryProof(input: LocalLanRecoveryProof): void {
  for (const value of [input.proofId, input.sessionId, input.executionId, input.deviceId, input.installationId, input.networkScopeId]) if (!value.trim()) throw new Error("Local/LAN recovery proof identity is invalid.");
  if (!input.syntheticOnly) throw new Error("Local/LAN recovery proof is synthetic-only.");
  if (input.decision !== "READY") throw new Error("Local/LAN recovery is blocked until installation and network scope are trusted.");
}
