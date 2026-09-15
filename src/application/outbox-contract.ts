export type OutboxEvent = Readonly<{
  eventId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: string;
  payloadFingerprint: string;
  occurredAt: string;
  status: "PENDING" | "PUBLISHED" | "FAILED";
  attemptCount: number;
}>;

export function createOutboxEvent(input: OutboxEvent): OutboxEvent {
  if (!input.eventId.trim() || !input.aggregateType.trim() || !input.aggregateId.trim() || !input.eventType.trim()) throw new Error("Outbox event identity is incomplete.");
  if (!input.payloadFingerprint.trim() || !input.occurredAt.trim()) throw new Error("Outbox event evidence is incomplete.");
  if (!Number.isInteger(input.attemptCount) || input.attemptCount < 0) throw new Error("Outbox attempt count is invalid.");
  return Object.freeze({ ...input });
}

export function assertOutboxReplaySafe(existing: OutboxEvent, candidate: OutboxEvent): void {
  if (existing.eventId !== candidate.eventId) throw new Error("Outbox event identity mismatch.");
  if (existing.payloadFingerprint !== candidate.payloadFingerprint) throw new Error("OUTBOX_EVENT_PAYLOAD_DRIFT");
}

export function nextOutboxAttempt(event: OutboxEvent, status: OutboxEvent["status"]): OutboxEvent {
  return createOutboxEvent({ ...event, status, attemptCount: event.attemptCount + 1 });
}
