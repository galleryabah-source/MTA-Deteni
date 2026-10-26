export const COMMAND_EXECUTION_BOUNDARY_VERSION = "P10.23-v1";

export interface CommandExecutionPrerequisites {
  authorizationAllowed: boolean;
  commandEnvelopeValid: boolean;
  idempotencyOutcome: "ACQUIRED" | "REPLAY" | "CONFLICT";
  domainStateValid: boolean;
  auditAvailable: boolean;
  outboxRequired: boolean;
  outboxAvailable: boolean;
}

export type ExecutionDecision =
  | "EXECUTE"
  | "REPLAY"
  | "DENY_AUTHORIZATION"
  | "DENY_ENVELOPE"
  | "DENY_IDEMPOTENCY_CONFLICT"
  | "DENY_STATE"
  | "FAIL_SAFE_AUDIT"
  | "FAIL_SAFE_OUTBOX";

export function decideCommandExecution(
  input: CommandExecutionPrerequisites,
): ExecutionDecision {
  if (!input.authorizationAllowed) return "DENY_AUTHORIZATION";
  if (!input.commandEnvelopeValid) return "DENY_ENVELOPE";
  if (input.idempotencyOutcome === "CONFLICT") return "DENY_IDEMPOTENCY_CONFLICT";
  if (input.idempotencyOutcome === "REPLAY") return "REPLAY";
  if (!input.domainStateValid) return "DENY_STATE";
  if (!input.auditAvailable) return "FAIL_SAFE_AUDIT";
  if (input.outboxRequired && !input.outboxAvailable) return "FAIL_SAFE_OUTBOX";
  return "EXECUTE";
}
