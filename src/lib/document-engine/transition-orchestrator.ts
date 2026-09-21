import type { DocumentArtifact } from "./artifact";
import type { DocumentAuditEvent } from "./audit-hook";
import type { DocumentBinding } from "./binding";
import type { DocumentLifecycle } from "./types";

export interface DocumentTransitionTransaction {
  readonly documentId: string;
  readonly from: DocumentLifecycle;
  readonly to: DocumentLifecycle;
  readonly artifact?: DocumentArtifact;
  readonly binding?: DocumentBinding;
  readonly audit: DocumentAuditEvent;
}

export interface DocumentTransitionTransactionPort {
  execute(input: DocumentTransitionTransaction): Promise<void>;
}

export interface DocumentTransitionResult {
  readonly committed: boolean;
  readonly documentId: string;
  readonly from: DocumentLifecycle;
  readonly to: DocumentLifecycle;
  readonly correlationId: string;
}

export class DocumentTransitionOrchestrator {
  constructor(private readonly transaction: DocumentTransitionTransactionPort) {}

  async execute(input: DocumentTransitionTransaction): Promise<DocumentTransitionResult> {
    if (!input.documentId.trim() || !input.audit.correlationId.trim()) {
      throw new Error("INVALID_DOCUMENT_TRANSITION_REQUEST");
    }
    if (input.audit.documentId !== input.documentId) throw new Error("AUDIT_DOCUMENT_MISMATCH");
    if (input.audit.fromLifecycle !== input.from || input.audit.toLifecycle !== input.to) {
      throw new Error("AUDIT_LIFECYCLE_MISMATCH");
    }
    if (input.binding && input.binding.documentId !== input.documentId) {
      throw new Error("BINDING_DOCUMENT_MISMATCH");
    }
    if (input.artifact && input.binding && input.binding.artifactId !== input.artifact.artifactId) {
      throw new Error("BINDING_ARTIFACT_MISMATCH");
    }

    await this.transaction.execute(input);
    return Object.freeze({
      committed: true,
      documentId: input.documentId,
      from: input.from,
      to: input.to,
      correlationId: input.audit.correlationId,
    });
  }
}
