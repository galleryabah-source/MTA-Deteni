import type { LifecycleCertification } from "./lifecycle-certification.js";
import type { RecoveryCertification } from "./recovery-certification.js";
import type { RuntimeCapabilities, RuntimeMode, DeviceClass } from "./runtime-continuity.js";
import { assertRuntimeSafety } from "./runtime-continuity.js";

export type RuntimeExecutionContext = Readonly<{
  executionId: string;
  runtimeMode: RuntimeMode;
  deviceClass: DeviceClass;
  networkScopeId: string;
  certificationJourneyId: string;
  authenticated: boolean;
  syntheticOnly: true;
}>;

export type RuntimeHandoff = Readonly<{
  fromMode: RuntimeMode;
  toMode: RuntimeMode;
  executionId: string;
  fromDeviceId: string;
  toDeviceId: string;
  fromNetworkScopeId: string;
  toNetworkScopeId: string;
  authorizationId: string;
  queuePending: boolean;
  reconciliationRequired: boolean;
  authorizationRequired: true;
  certificationBound: true;
  syntheticOnly: true;
}>;

function assertIdentity(...values: readonly string[]): void {
  if (values.some((value) => !value.trim())) throw new Error("Runtime execution identity is required.");
}

export function assertRuntimeExecutionContext(context: RuntimeExecutionContext, capabilities: RuntimeCapabilities): void {
  assertIdentity(context.executionId, context.networkScopeId, context.certificationJourneyId);
  assertRuntimeSafety(capabilities);
  if (context.runtimeMode !== capabilities.mode || context.deviceClass !== capabilities.device) throw new Error("Runtime context/capability mismatch.");
  if (!context.authenticated) throw new Error("Runtime execution requires authenticated context.");
  if (!context.syntheticOnly) throw new Error("Runtime execution contract is synthetic-only.");
}

export function bindRuntimeToLifecycle(context: RuntimeExecutionContext, lifecycle: LifecycleCertification): void {
  if (context.certificationJourneyId !== lifecycle.journeyId) throw new Error("Runtime/lifecycle certification binding mismatch.");
  if (!lifecycle.syntheticOnly) throw new Error("Runtime binding requires synthetic lifecycle certification.");
}

export function bindRuntimeToRecovery(context: RuntimeExecutionContext, recovery: RecoveryCertification): void {
  if (context.certificationJourneyId !== recovery.journeyId) throw new Error("Runtime/recovery certification binding mismatch.");
  if (!recovery.syntheticOnly) throw new Error("Runtime binding requires synthetic recovery certification.");
}

export function createRuntimeHandoff(input: { executionId: string; fromMode: RuntimeMode; toMode: RuntimeMode; fromDeviceId: string; toDeviceId: string; fromNetworkScopeId: string; toNetworkScopeId: string; authorizationId: string; queuePending: boolean }): RuntimeHandoff {
  assertIdentity(input.executionId, input.fromDeviceId, input.toDeviceId, input.fromNetworkScopeId, input.toNetworkScopeId, input.authorizationId);
  if (input.fromMode === input.toMode) throw new Error("Runtime handoff requires a mode transition.");
  const reconciliationRequired = input.queuePending || input.fromMode !== "CLOUD" || input.fromNetworkScopeId !== input.toNetworkScopeId || input.fromDeviceId !== input.toDeviceId;
  return Object.freeze({ fromMode: input.fromMode, toMode: input.toMode, executionId: input.executionId, fromDeviceId: input.fromDeviceId, toDeviceId: input.toDeviceId, fromNetworkScopeId: input.fromNetworkScopeId, toNetworkScopeId: input.toNetworkScopeId, authorizationId: input.authorizationId, queuePending: input.queuePending, reconciliationRequired, authorizationRequired: true, certificationBound: true, syntheticOnly: true });
}

export function assertRuntimeHandoffSafety(handoff: RuntimeHandoff): void {
  assertIdentity(handoff.executionId, handoff.fromDeviceId, handoff.toDeviceId, handoff.fromNetworkScopeId, handoff.toNetworkScopeId, handoff.authorizationId);
  if (!handoff.syntheticOnly || !handoff.certificationBound) throw new Error("Runtime handoff is not certified.");
  if (!handoff.authorizationRequired) throw new Error("Runtime handoff cannot bypass authorization.");
  if (handoff.queuePending && !handoff.reconciliationRequired) throw new Error("Pending queue requires reconciliation before handoff completion.");
  if (handoff.fromMode !== "CLOUD" && !handoff.reconciliationRequired) throw new Error("Non-cloud handoff requires reconciliation continuity.");
  if (handoff.fromNetworkScopeId !== handoff.toNetworkScopeId && !handoff.reconciliationRequired) throw new Error("Network scope change requires reconciliation continuity.");
  if (handoff.fromDeviceId !== handoff.toDeviceId && !handoff.reconciliationRequired) throw new Error("Device change requires reconciliation continuity.");
}
