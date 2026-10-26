export const RUNTIME_COMMAND_ORCHESTRATION_VERSION = "P10.28-v1";

export type RuntimeCommandDecision =
  | "EXECUTE"
  | "REPLAY"
  | "DENY_AUTHORIZATION"
  | "DENY_STATE"
  | "BLOCKED_RUNTIME"
  | "BLOCKED_AUDIT"
  | "BLOCKED_OUTBOX";

export interface RuntimeCommandInput {
  authorized: boolean;
  idempotencyOutcome: "ACQUIRED" | "REPLAY" | "CONFLICT";
  domainStateValid: boolean;
  runtimeReady: boolean;
  auditAvailable: boolean;
  outboxRequired: boolean;
  outboxAvailable: boolean;
}

export function decideRuntimeCommand(
  input: RuntimeCommandInput,
): RuntimeCommandDecision {
  if (!input.authorized) return "DENY_AUTHORIZATION";
  if (input.idempotencyOutcome === "CONFLICT") return "DENY_STATE";
  if (input.idempotencyOutcome === "REPLAY") return "REPLAY";
  if (!input.domainStateValid) return "DENY_STATE";
  if (!input.runtimeReady) return "BLOCKED_RUNTIME";
  if (!input.auditAvailable) return "BLOCKED_AUDIT";
  if (input.outboxRequired && !input.outboxAvailable) return "BLOCKED_OUTBOX";
  return "EXECUTE";
}

export interface RuntimeCommandEnvelope {
  requestId: string;
  correlationId: string;
  idempotencyKey: string;
  actorId: string;
  policyVersion: string;
  commandType: string;
}

export function isValidRuntimeCommandEnvelope(
  envelope: RuntimeCommandEnvelope,
): boolean {
  return Object.values(envelope).every(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}
