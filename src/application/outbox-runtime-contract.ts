export type OutboxEventStatus = "PENDING" | "DISPATCHED" | "FAILED";

export type OutboxEventContract = Readonly<{
  eventId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Readonly<Record<string, unknown>>;
  payloadFingerprint: string;
  occurredAt: string;
  status: OutboxEventStatus;
  attemptCount: number;
}>;

export type OutboxDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export type OutboxStoreContract = Readonly<{
  appendPending: (event: OutboxEventContract) => Promise<OutboxDisposition>;
}>;

export function validateOutboxEvent(event: OutboxEventContract): void {
  const required = [event.eventId, event.aggregateType, event.aggregateId, event.eventType, event.payloadFingerprint, event.occurredAt];
  if (required.some((value) => !value.trim())) throw new Error("OUTBOX_IDENTITY_REQUIRED");
  if (!Number.isInteger(event.attemptCount) || event.attemptCount < 0) throw new Error("OUTBOX_ATTEMPT_COUNT_INVALID");
  if (event.status !== "PENDING") throw new Error("OUTBOX_APPEND_REQUIRES_PENDING");
}

export function createOutboxEvent(event: Omit<OutboxEventContract, "status" | "attemptCount">): OutboxEventContract {
  const pending = Object.freeze({ ...event, status: "PENDING" as const, attemptCount: 0 });
  validateOutboxEvent(pending);
  return pending;
}

export async function appendMandatoryOutboxEvent(
  store: OutboxStoreContract,
  event: OutboxEventContract,
): Promise<OutboxDisposition> {
  validateOutboxEvent(event);
  return store.appendPending(event);
}
