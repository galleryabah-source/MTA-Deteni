import type { ExecutionContext } from "./execution-context-contract.js";
import type { OutboxEvent, OutboxEnqueueCommand, OutboxStatus } from "./outbox-contract.js";
import { validateOutboxEnqueue, validateOutboxEvent } from "./outbox-contract.js";

export type CanonicalOutboxEvent = Readonly<OutboxEvent & {
  executionContext: ExecutionContext;
}>;

export type OutboxDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export type OutboxStoreContract = Readonly<{
  appendPending: (event: CanonicalOutboxEvent) => Promise<OutboxDisposition>;
}>;

export function createOutboxEvent(
  command: OutboxEnqueueCommand,
  executionContext: ExecutionContext,
  timestamps: { availableAt: string; createdAt: string },
): CanonicalOutboxEvent {
  validateOutboxEnqueue(command);
  if (!executionContext.requestId.trim() ||
      !executionContext.correlationId.trim() ||
      !executionContext.transactionId.trim() ||
      !executionContext.idempotencyKey.trim()) {
    throw new Error("OUTBOX_EXECUTION_CONTEXT_REQUIRED");
  }
  if (executionContext.idempotencyKey !== command.idempotencyKey) {
    throw new Error("OUTBOX_IDEMPOTENCY_CONTEXT_MISMATCH");
  }

  const event: CanonicalOutboxEvent = Object.freeze({
    ...command,
    executionContext,
    status: "PENDING",
    attempts: 0,
    availableAt: timestamps.availableAt,
    createdAt: timestamps.createdAt,
  });
  validateOutboxEvent(event);
  return event;
}

export function transitionOutboxEvent(
  event: CanonicalOutboxEvent,
  status: OutboxStatus,
  patch: Partial<Pick<CanonicalOutboxEvent, "availableAt" | "lockedAt" | "publishedAt" | "lastError">> = {},
): CanonicalOutboxEvent {
  const next: CanonicalOutboxEvent = Object.freeze({
    ...event,
    ...patch,
    status,
    attempts: status === "PROCESSING" ? event.attempts + 1 : event.attempts,
  });
  validateOutboxEvent(next);
  return next;
}

export async function appendMandatoryOutboxEvent(
  store: OutboxStoreContract,
  event: CanonicalOutboxEvent,
): Promise<OutboxDisposition> {
  validateOutboxEvent(event);
  return store.appendPending(event);
}
