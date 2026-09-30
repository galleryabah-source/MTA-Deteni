import type { ExecutionContext } from "./execution-context-contract.js";
import type { OutboxEvent, OutboxEnqueueCommand, OutboxStatus } from "./outbox-contract.js";
import { validateOutboxEnqueue, validateOutboxEvent as validateCanonicalOutboxEvent } from "./outbox-contract.ts";

export type OutboxEventContract = Readonly<OutboxEvent & {
  executionContext: ExecutionContext;
  payloadFingerprint: string;
}>;

export type OutboxDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export function validateOutboxEvent(event: OutboxEventContract): void {
  validateCanonicalOutboxEvent(event);
  validateExecutionContext(event);
  if (!event.payloadFingerprint.trim()) throw new Error("OUTBOX_PAYLOAD_FINGERPRINT_REQUIRED");
}

export type OutboxStoreContract = Readonly<{
  appendPending: (event: OutboxEventContract) => Promise<OutboxDisposition>;
}>;

// Application evidence envelope over the canonical production outbox event.
// executionContext and payloadFingerprint are not a second persistence model.
export type CanonicalOutboxCreateInput = Readonly<OutboxEnqueueCommand & {
  executionContext: ExecutionContext;
  payloadFingerprint: string;
}>;

function validateExecutionContext(event: OutboxEventContract): void {
  if (!event.executionContext.requestId.trim() ||
      !event.executionContext.correlationId.trim() ||
      !event.executionContext.transactionId.trim() ||
      !event.executionContext.idempotencyKey.trim()) {
    throw new Error("OUTBOX_EXECUTION_CONTEXT_REQUIRED");
  }
  if (event.executionContext.idempotencyKey !== event.idempotencyKey) {
    throw new Error("OUTBOX_IDEMPOTENCY_CONTEXT_MISMATCH");
  }
}

export function createOutboxEvent(input: CanonicalOutboxCreateInput): OutboxEventContract {
  validateOutboxEnqueue(input);
  if (!input.executionContext.requestId.trim() ||
      !input.executionContext.correlationId.trim() ||
      !input.executionContext.transactionId.trim() ||
      !input.executionContext.idempotencyKey.trim()) {
    throw new Error("OUTBOX_EXECUTION_CONTEXT_REQUIRED");
  }
  if (input.executionContext.idempotencyKey !== input.idempotencyKey) {
    throw new Error("OUTBOX_IDEMPOTENCY_CONTEXT_MISMATCH");
  }
  if (!input.payloadFingerprint.trim()) throw new Error("OUTBOX_PAYLOAD_FINGERPRINT_REQUIRED");

  const event: OutboxEventContract = Object.freeze({
    eventId: input.eventId,
    eventType: input.eventType,
    aggregateType: input.aggregateType,
    ...(input.aggregateId === undefined ? {} : { aggregateId: input.aggregateId }),
    payload: input.payload,
    idempotencyKey: input.idempotencyKey,
    occurredAt: input.occurredAt,
    executionContext: input.executionContext,
    payloadFingerprint: input.payloadFingerprint,
    status: "PENDING",
    attempts: 0,
    availableAt: input.occurredAt,
    createdAt: input.occurredAt,
  });
  validateOutboxEvent(event);
  return event;
}

export function transitionOutboxEvent(
  event: OutboxEventContract,
  status: OutboxStatus,
  patch: Partial<Pick<OutboxEventContract, "availableAt" | "lockedAt" | "publishedAt" | "lastError">> = {},
): OutboxEventContract {
  const next: OutboxEventContract = Object.freeze({
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
  event: OutboxEventContract,
): Promise<OutboxDisposition> {
  validateOutboxEvent(event);
  if (!event.payloadFingerprint.trim()) throw new Error("OUTBOX_PAYLOAD_FINGERPRINT_REQUIRED");
  return store.appendPending(event);
}