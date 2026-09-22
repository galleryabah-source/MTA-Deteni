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

export function validateOutboxEnqueue(command: OutboxEnqueueCommand): void {
  if (!command.eventId.trim()) throw new Error("OUTBOX_EVENT_ID_REQUIRED");
  if (!command.eventType.trim()) throw new Error("OUTBOX_EVENT_TYPE_REQUIRED");
  if (!command.aggregateType.trim()) throw new Error("OUTBOX_AGGREGATE_TYPE_REQUIRED");
  if (!command.idempotencyKey.trim()) throw new Error("OUTBOX_IDEMPOTENCY_KEY_REQUIRED");
  if (!command.occurredAt.trim()) throw new Error("OUTBOX_OCCURRED_AT_REQUIRED");
  if (!command.payload || typeof command.payload !== "object" || Array.isArray(command.payload)) {
    throw new Error("OUTBOX_PAYLOAD_OBJECT_REQUIRED");
  }
}
