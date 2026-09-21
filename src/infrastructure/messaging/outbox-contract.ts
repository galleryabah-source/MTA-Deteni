export const OUTBOX_CONTRACT_VERSION = "P9.8-v1";

export type OutboxStatus = "PENDING" | "DISPATCHED" | "FAILED";

export interface OutboxEvent {
  eventId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payloadHash: string;
  occurredAt: string;
  status: OutboxStatus;
  attemptCount: number;
}

export function validateOutboxEvent(event: OutboxEvent): void {
  const required = [
    ["eventId", event.eventId],
    ["aggregateType", event.aggregateType],
    ["aggregateId", event.aggregateId],
    ["eventType", event.eventType],
    ["payloadHash", event.payloadHash],
    ["occurredAt", event.occurredAt],
  ] as const;

  for (const [name, value] of required) {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error("OUTBOX_" + name.toUpperCase() + "_REQUIRED");
    }
  }

  if (!Number.isInteger(event.attemptCount) || event.attemptCount < 0) {
    throw new Error("OUTBOX_ATTEMPT_COUNT_INVALID");
  }
}

export function nextOutboxStatus(
  status: OutboxStatus,
  deliverySucceeded: boolean,
): OutboxStatus {
  if (status === "DISPATCHED") {
    return "DISPATCHED";
  }

  return deliverySucceeded ? "DISPATCHED" : "FAILED";
}
