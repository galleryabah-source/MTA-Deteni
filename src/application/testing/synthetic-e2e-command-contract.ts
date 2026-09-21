export const SYNTHETIC_E2E_COMMAND_CONTRACT_VERSION = "P10.36-v1";

export type SyntheticE2EDecision =
  | "READY_FOR_EXECUTION"
  | "BLOCKED_AUTHORIZATION"
  | "BLOCKED_IDEMPOTENCY"
  | "BLOCKED_STATE"
  | "BLOCKED_RUNTIME"
  | "BLOCKED_AUDIT"
  | "BLOCKED_OUTBOX";

export interface SyntheticE2EInput {
  syntheticOnly: boolean;
  authorized: boolean;
  idempotency: "ACQUIRED" | "REPLAY" | "CONFLICT";
  stateValid: boolean;
  runtimeReady: boolean;
  auditAvailable: boolean;
  outboxRequired: boolean;
  outboxAvailable: boolean;
}

export function evaluateSyntheticE2E(
  input: SyntheticE2EInput,
): SyntheticE2EDecision {
  if (!input.syntheticOnly) throw new Error("SYNTHETIC_ONLY_REQUIRED");
  if (!input.authorized) return "BLOCKED_AUTHORIZATION";
  if (input.idempotency === "CONFLICT") return "BLOCKED_IDEMPOTENCY";
  if (input.idempotency === "REPLAY") return "BLOCKED_IDEMPOTENCY";
  if (!input.stateValid) return "BLOCKED_STATE";
  if (!input.runtimeReady) return "BLOCKED_RUNTIME";
  if (!input.auditAvailable) return "BLOCKED_AUDIT";
  if (input.outboxRequired && !input.outboxAvailable) return "BLOCKED_OUTBOX";
  return "READY_FOR_EXECUTION";
}
