import type { DocumentArtifact } from "./artifact";
import type { DocumentAuditEvent } from "./audit-hook";
import type { DocumentBinding } from "./binding";
import type { DocumentLifecycle } from "./types";
import type { NumberingRegister } from "./numbering";
import type { AtomicNumberReservation } from "./atomic-numbering";

export interface DocumentPersistenceTransaction {
  readonly documentId: string;
  readonly from: DocumentLifecycle;
  readonly to: DocumentLifecycle;
  readonly artifact?: DocumentArtifact;
  readonly binding?: DocumentBinding;
  readonly numberingReservation?: AtomicNumberReservation;
  readonly numberingRegister?: NumberingRegister;
  readonly audit: DocumentAuditEvent;
  readonly idempotencyKey: string;
  readonly requestFingerprint: string;
}

export interface DocumentPersistenceAdapter {
  /**
   * Must be the single durable transaction boundary for document issuance and
   * related state. Implementations must guarantee all-or-nothing semantics.
   */
  executeAtomic(input: DocumentPersistenceTransaction): Promise<void>;
}

export const validatePersistenceTransaction = (input: DocumentPersistenceTransaction): void => {
  if (!input.documentId.trim()) throw new Error("INVALID_DOCUMENT_ID");
  if (!input.idempotencyKey.trim()) throw new Error("INVALID_IDEMPOTENCY_KEY");
  if (!/^[a-f0-9]{64}$/.test(input.requestFingerprint)) throw new Error("INVALID_REQUEST_FINGERPRINT");
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
  if (input.numberingRegister && input.numberingReservation && input.numberingRegister.registerKey !== input.numberingReservation.registerKey) {
    throw new Error("NUMBERING_REGISTER_MISMATCH");
  }
};

export class InMemoryDocumentPersistenceAdapter implements DocumentPersistenceAdapter {
  private committed = false;

  async executeAtomic(input: DocumentPersistenceTransaction): Promise<void> {
    validatePersistenceTransaction(input);
    if (this.committed) throw new Error("PERSISTENCE_TRANSACTION_ALREADY_COMMITTED");
    this.committed = true;
  }
}
