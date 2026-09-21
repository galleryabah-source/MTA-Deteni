import { createHash } from "node:crypto";

export type DocumentOutboxStatus = "PENDING" | "PROCESSING" | "DELIVERED" | "FAILED";

export interface DocumentOutboxEvent {
  readonly eventId: string;
  readonly eventType: "DOCUMENT_ISSUED" | "DOCUMENT_DISTRIBUTION_REQUESTED" | "DOCUMENT_ARCHIVE_REQUESTED";
  readonly aggregateId: string;
  readonly idempotencyKey: string;
  readonly payloadFingerprint: string;
  readonly status: DocumentOutboxStatus;
  readonly attempts: number;
  readonly occurredAt: string;
  readonly deliveredAt?: string;
  readonly lastErrorCode?: string;
}

export interface DocumentOutboxStore {
  enqueue(event: DocumentOutboxEvent): Promise<void>;
  claim(eventId: string): Promise<DocumentOutboxEvent | undefined>;
  markDelivered(eventId: string, deliveredAt: string): Promise<void>;
  markFailed(eventId: string, errorCode: string): Promise<void>;
  get(eventId: string): Promise<DocumentOutboxEvent | undefined>;
}

export const fingerprintOutboxPayload = (payload: Readonly<Record<string, unknown>>): string =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");

export const validateOutboxEvent = (event: DocumentOutboxEvent): void => {
  if (!event.eventId.trim() || !event.aggregateId.trim() || !event.idempotencyKey.trim()) {
    throw new Error("INVALID_OUTBOX_IDENTITY");
  }
  if (!/^[a-f0-9]{64}$/.test(event.payloadFingerprint)) throw new Error("INVALID_OUTBOX_FINGERPRINT");
  if (!Number.isInteger(event.attempts) || event.attempts < 0) throw new Error("INVALID_OUTBOX_ATTEMPTS");
  if (Number.isNaN(Date.parse(event.occurredAt))) throw new Error("INVALID_OUTBOX_DATE");
};

export class InMemoryDocumentOutboxStore implements DocumentOutboxStore {
  private readonly events = new Map<string, DocumentOutboxEvent>();

  async enqueue(input: DocumentOutboxEvent): Promise<void> {
    validateOutboxEvent(input);
    if (this.events.has(input.eventId)) throw new Error("OUTBOX_EVENT_IMMUTABLE");
    this.events.set(input.eventId, Object.freeze({ ...input }));
  }

  async claim(eventId: string): Promise<DocumentOutboxEvent | undefined> {
    const event = this.events.get(eventId);
    if (!event || event.status === "DELIVERED") return undefined;
    const processing = Object.freeze({ ...event, status: "PROCESSING" as const, attempts: event.attempts + 1 });
    this.events.set(eventId, processing);
    return Object.freeze({ ...processing });
  }

  async markDelivered(eventId: string, deliveredAt: string): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) throw new Error("OUTBOX_EVENT_NOT_FOUND");
    if (event.status === "DELIVERED") return;
    if (Number.isNaN(Date.parse(deliveredAt))) throw new Error("INVALID_OUTBOX_DELIVERED_DATE");
    this.events.set(eventId, Object.freeze({ ...event, status: "DELIVERED", deliveredAt }));
  }

  async markFailed(eventId: string, errorCode: string): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) throw new Error("OUTBOX_EVENT_NOT_FOUND");
    if (!errorCode.trim()) throw new Error("INVALID_OUTBOX_ERROR_CODE");
    this.events.set(eventId, Object.freeze({ ...event, status: "FAILED", lastErrorCode: errorCode }));
  }

  async get(eventId: string): Promise<DocumentOutboxEvent | undefined> {
    const event = this.events.get(eventId);
    return event ? Object.freeze({ ...event }) : undefined;
  }
}
