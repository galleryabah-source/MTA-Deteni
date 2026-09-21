export const CRITICAL_COMMAND_GATE_VERSION = "P10.21-v1";

export interface CriticalCommandInput {
  authorized: boolean;
  idempotencyOutcome: "ACQUIRED" | "REPLAY" | "CONFLICT";
  domainStateValid: boolean;
  auditAvailable: boolean;
  outboxRequired: boolean;
}

export type CriticalCommandDecision =
  | "EXECUTE"
  | "REPLAY"
  | "DENY_AUTHORIZATION"
  | "DENY_STATE"
  | "DENY_IDEMPOTENCY_CONFLICT"
  | "FAIL_SAFE_AUDIT"
  | "FAIL_SAFE_OUTBOX";

export function evaluateCriticalCommand(input: CriticalCommandInput): CriticalCommandDecision {
  if (!input.authorized) return "DENY_AUTHORIZATION";
  if (input.idempotencyOutcome === "CONFLICT") return "DENY_IDEMPOTENCY_CONFLICT";
  if (input.idempotencyOutcome === "REPLAY") return "REPLAY";
  if (!input.domainStateValid) return "DENY_STATE";
  if (!input.auditAvailable) return "FAIL_SAFE_AUDIT";
  if (input.outboxRequired === false) return "EXECUTE";
  return "FAIL_SAFE_OUTBOX";
}
