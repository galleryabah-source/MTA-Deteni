import type { DocumentLifecycle } from "./types";
import type { DocumentAuditEvent } from "./audit-hook";

export interface DocumentLifecycleTransition {
  readonly documentId: string;
  readonly from: DocumentLifecycle;
  readonly to: DocumentLifecycle;
  readonly actorUserId: string;
  readonly occurredAt: string;
  readonly correlationId: string;
}

export interface DocumentLifecycleRepository {
  transition(input: DocumentLifecycleTransition, audit: DocumentAuditEvent): Promise<void>;
  getLifecycle(documentId: string): Promise<DocumentLifecycle | undefined>;
}

const allowedTransitions: Readonly<Record<DocumentLifecycle, readonly DocumentLifecycle[]>> = {
  DRAFT: ["GENERATED"],
  GENERATED: ["REVIEWED"],
  REVIEWED: ["APPROVED"],
  APPROVED: ["ISSUED"],
  ISSUED: ["DOWNLOADED", "DISTRIBUTED", "ARCHIVED"],
  DOWNLOADED: ["DISTRIBUTED", "ARCHIVED"],
  DISTRIBUTED: ["ARCHIVED"],
  ARCHIVED: [],
};

export const assertLifecycleTransition = (from: DocumentLifecycle, to: DocumentLifecycle): void => {
  if (!allowedTransitions[from].includes(to)) throw new Error("INVALID_DOCUMENT_LIFECYCLE_TRANSITION");
};

export class InMemoryDocumentLifecycleRepository implements DocumentLifecycleRepository {
  private readonly states = new Map<string, DocumentLifecycle>();

  async transition(input: DocumentLifecycleTransition, audit: DocumentAuditEvent): Promise<void> {
    if (!input.documentId.trim() || !input.actorUserId.trim() || !input.correlationId.trim()) {
      throw new Error("INVALID_LIFECYCLE_TRANSITION");
    }
    if (input.auditCorrelationId !== undefined) {
      throw new Error("UNSUPPORTED_AUDIT_OVERRIDE");
    }
    if (audit.documentId !== input.documentId || audit.correlationId !== input.correlationId) {
      throw new Error("AUDIT_TRANSITION_MISMATCH");
    }
    if (audit.fromLifecycle !== input.from || audit.toLifecycle !== input.to) {
      throw new Error("AUDIT_LIFECYCLE_MISMATCH");
    }
    const current = this.states.get(input.documentId) ?? input.from;
    if (current !== input.from) throw new Error("STALE_DOCUMENT_LIFECYCLE");
    assertLifecycleTransition(input.from, input.to);
    if (input.to === "ARCHIVED" && current === "ARCHIVED") throw new Error("DOCUMENT_ALREADY_ARCHIVED");
    this.states.set(input.documentId, input.to);
  }

  async getLifecycle(documentId: string): Promise<DocumentLifecycle | undefined> {
    return this.states.get(documentId);
  }
}
