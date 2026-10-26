export const OUTBOX_REPOSITORY_BOUNDARY_VERSION = "P9.20-v1";

export interface OutboxRecord {
  eventId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payloadHash: string;
  occurredAt: string;
  status: "PENDING" | "DISPATCHED" | "FAILED";
  attemptCount: number;
}

export interface OutboxRepository {
  append(record: OutboxRecord): Promise<void>;
  markDispatched(eventId: string): Promise<void>;
  markFailed(eventId: string): Promise<void>;
}

export function validateOutboxRecord(record: OutboxRecord): boolean {
  return Boolean(
    record.eventId &&
    record.aggregateType &&
    record.aggregateId &&
    record.eventType &&
    record.payloadHash &&
    record.occurredAt &&
    record.attemptCount >= 0
  );
}
