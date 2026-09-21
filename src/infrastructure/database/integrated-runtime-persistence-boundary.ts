export const INTEGRATED_RUNTIME_PERSISTENCE_BOUNDARY_VERSION = "P9.31-v1";

export type RuntimePersistenceDecision =
  | "READY"
  | "BLOCKED_RUNTIME"
  | "BLOCKED_TRANSACTION"
  | "BLOCKED_AUDIT"
  | "BLOCKED_OUTBOX";

export interface IntegratedRuntimePersistenceInput {
  runtimeReady: boolean;
  transactionReady: boolean;
  auditAvailable: boolean;
  outboxRequired: boolean;
  outboxAvailable: boolean;
}

export function evaluateIntegratedRuntimePersistence(
  input: IntegratedRuntimePersistenceInput,
): RuntimePersistenceDecision {
  if (!input.runtimeReady) return "BLOCKED_RUNTIME";
  if (!input.transactionReady) return "BLOCKED_TRANSACTION";
  if (!input.auditAvailable) return "BLOCKED_AUDIT";
  if (input.outboxRequired && !input.outboxAvailable) return "BLOCKED_OUTBOX";
  return "READY";
}

export interface RuntimeMutationEnvelope {
  requestId: string;
  correlationId: string;
  idempotencyKey: string;
  actorId: string;
  policyVersion: string;
}

export function validateRuntimeMutationEnvelope(
  envelope: RuntimeMutationEnvelope,
): boolean {
  return Object.values(envelope).every(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}
