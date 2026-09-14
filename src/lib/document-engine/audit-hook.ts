import type { DocumentLifecycle, DocumentKind } from "./types";

export type DocumentAuditAction =
  | "GENERATE"
  | "REVIEW"
  | "APPROVE"
  | "ISSUE"
  | "DOWNLOAD"
  | "DISTRIBUTE"
  | "ARCHIVE";

export interface DocumentAuditEvent {
  readonly eventId: string;
  readonly documentId: string;
  readonly documentKind: DocumentKind;
  readonly action: DocumentAuditAction;
  readonly fromLifecycle?: DocumentLifecycle;
  readonly toLifecycle?: DocumentLifecycle;
  readonly actorUserId: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly documentContentHash?: string;
}

export interface DocumentAuditSink {
  append(event: DocumentAuditEvent): Promise<void>;
}

export const validateDocumentAuditEvent = (event: DocumentAuditEvent): void => {
  if (!event.eventId || !event.documentId || !event.actorUserId || !event.correlationId) {
    throw new Error("INVALID_DOCUMENT_AUDIT_EVENT");
  }
  if (Number.isNaN(Date.parse(event.occurredAt))) throw new Error("INVALID_DOCUMENT_AUDIT_DATE");
  if (event.documentContentHash !== undefined && !/^[a-f0-9]{64}$/.test(event.documentContentHash)) {
    throw new Error("INVALID_DOCUMENT_AUDIT_HASH");
  }
};

/** Adapter boundary only; durable append and hash-chain persistence belong to the audit layer. */
export class NoopDocumentAuditSink implements DocumentAuditSink {
  async append(event: DocumentAuditEvent): Promise<void> {
    validateDocumentAuditEvent(event);
  }
}
