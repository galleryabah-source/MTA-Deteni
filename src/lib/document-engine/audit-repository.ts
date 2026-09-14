import { createHash } from "node:crypto";
import { validateDocumentAuditEvent, type DocumentAuditEvent, type DocumentAuditSink } from "./audit-hook";

export interface PersistedDocumentAuditEvent extends DocumentAuditEvent {
  readonly sequence: number;
  readonly previousEventHash: string;
  readonly eventHash: string;
}

export interface DocumentAuditRepository extends DocumentAuditSink {
  getAll(): Promise<readonly PersistedDocumentAuditEvent[]>;
  verifyIntegrity(): Promise<boolean>;
}

const canonicalize = (event: DocumentAuditEvent, sequence: number, previousEventHash: string): string =>
  JSON.stringify({
    sequence,
    previousEventHash,
    eventId: event.eventId,
    documentId: event.documentId,
    documentKind: event.documentKind,
    action: event.action,
    fromLifecycle: event.fromLifecycle ?? null,
    toLifecycle: event.toLifecycle ?? null,
    actorUserId: event.actorUserId,
    occurredAt: event.occurredAt,
    correlationId: event.correlationId,
    documentContentHash: event.documentContentHash ?? null,
  });

const hashEvent = (event: DocumentAuditEvent, sequence: number, previousEventHash: string): string =>
  createHash("sha256").update(canonicalize(event, sequence, previousEventHash)).digest("hex");

export class InMemoryDocumentAuditRepository implements DocumentAuditRepository {
  private readonly events: PersistedDocumentAuditEvent[] = [];

  async append(event: DocumentAuditEvent): Promise<void> {
    validateDocumentAuditEvent(event);
    if (this.events.some((item) => item.eventId === event.eventId)) {
      throw new Error("AUDIT_EVENT_IMMUTABLE");
    }

    const sequence = this.events.length + 1;
    const previousEventHash = this.events.at(-1)?.eventHash ?? "GENESIS";
    const eventHash = hashEvent(event, sequence, previousEventHash);
    this.events.push(Object.freeze({ ...event, sequence, previousEventHash, eventHash }));
  }

  async getAll(): Promise<readonly PersistedDocumentAuditEvent[]> {
    return this.events.map((event) => Object.freeze({ ...event }));
  }

  async verifyIntegrity(): Promise<boolean> {
    let previousEventHash = "GENESIS";
    for (let index = 0; index < this.events.length; index += 1) {
      const event = this.events[index];
      const expectedSequence = index + 1;
      if (event.sequence !== expectedSequence || event.previousEventHash !== previousEventHash) return false;
      if (event.eventHash !== hashEvent(event, event.sequence, event.previousEventHash)) return false;
      previousEventHash = event.eventHash;
    }
    return true;
  }
}
