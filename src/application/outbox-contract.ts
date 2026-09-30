export type OutboxStatus = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";

export type OutboxEvent = Readonly<{
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId?: string;
  payload: Readonly<Record<string, unknown>>;
  idempotencyKey: string;
  occurredAt: string;
  status: OutboxStatus;
  attempts: number;
  availableAt: string;
  lockedAt?: string;
  publishedAt?: string;
  lastError?: string;
  createdAt: string;
}>;

export type OutboxEnqueueCommand = Readonly<{
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId?: string;
  payload: Readonly<Record<string, unknown>>;
  idempotencyKey: string;
  occurredAt: string;
}>;

const requiredText = (value: string | undefined, code: string): void => {
  if (!value?.trim()) throw new Error(code);
};

export function createOutboxEvent(command: OutboxEnqueueCommand): OutboxEvent {
  validateOutboxEnqueue(command);
  return Object.freeze({
    ...command,
    status: "PENDING" as const,
    attempts: 0,
    availableAt: command.occurredAt,
    createdAt: command.occurredAt,
  });
}

export function validateOutboxEnqueue(command: OutboxEnqueueCommand): void {
  requiredText(command.eventId, "OUTBOX_EVENT_ID_REQUIRED");
  requiredText(command.eventType, "OUTBOX_EVENT_TYPE_REQUIRED");
  requiredText(command.aggregateType, "OUTBOX_AGGREGATE_TYPE_REQUIRED");
  requiredText(command.idempotencyKey, "OUTBOX_IDEMPOTENCY_KEY_REQUIRED");
  requiredText(command.occurredAt, "OUTBOX_OCCURRED_AT_REQUIRED");
  if (!command.payload || typeof command.payload !== "object" || Array.isArray(command.payload)) {
    throw new Error("OUTBOX_PAYLOAD_OBJECT_REQUIRED");
  }
}

export function validateOutboxEvent(event: OutboxEvent): void {
  requiredText(event.eventId, "OUTBOX_EVENT_ID_REQUIRED");
  requiredText(event.eventType, "OUTBOX_EVENT_TYPE_REQUIRED");
  requiredText(event.aggregateType, "OUTBOX_AGGREGATE_TYPE_REQUIRED");
  requiredText(event.idempotencyKey, "OUTBOX_IDEMPOTENCY_KEY_REQUIRED");
  requiredText(event.occurredAt, "OUTBOX_OCCURRED_AT_REQUIRED");
  requiredText(event.availableAt, "OUTBOX_AVAILABLE_AT_REQUIRED");
  requiredText(event.createdAt, "OUTBOX_CREATED_AT_REQUIRED");
  if (!event.payload || typeof event.payload !== "object" || Array.isArray(event.payload)) {
    throw new Error("OUTBOX_PAYLOAD_OBJECT_REQUIRED");
  }
  if (!Number.isInteger(event.attempts) || event.attempts < 0) {
    throw new Error("OUTBOX_ATTEMPTS_INVALID");
  }
  if (!["PENDING", "PROCESSING", "PUBLISHED", "FAILED"].includes(event.status)) {
    throw new Error("OUTBOX_STATUS_INVALID");
  }
}

export function assertOutboxReplaySafe(existing: OutboxEvent, candidate: OutboxEvent): void {
  if (existing.eventId !== candidate.eventId) throw new Error("OUTBOX_EVENT_ID_MISMATCH");
  if (existing.idempotencyKey !== candidate.idempotencyKey) throw new Error("OUTBOX_IDEMPOTENCY_MISMATCH");
  if (JSON.stringify(existing.payload) !== JSON.stringify(candidate.payload)) {
    throw new Error("OUTBOX_EVENT_PAYLOAD_DRIFT");
  }
}

export function nextOutboxAttempt(event: OutboxEvent, status: OutboxStatus = "PROCESSING"): OutboxEvent {
  if (status !== "PROCESSING" && status !== "FAILED") {
    throw new Error("OUTBOX_ATTEMPT_STATUS_INVALID");
  }
  return Object.freeze({
    ...event,
    status,
    attempts: event.attempts + 1,
  });
}
