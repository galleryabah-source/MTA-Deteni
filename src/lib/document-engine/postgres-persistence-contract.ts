import type { DocumentArtifact } from "./artifact";
import type { DocumentAuditEvent } from "./audit-hook";
import type { DocumentBinding } from "./binding";
import type { DocumentLifecycle } from "./types";
import type { NumberingRegister, NumberingReservation } from "./numbering";

/**
 * Contract-only boundary for a future PostgreSQL adapter.
 * No SQL, schema, migration, or ORM assumptions belong here.
 */
export interface PostgresTransactionContext {
  readonly transactionId: string;
  readonly isolationLevel: "READ_COMMITTED" | "REPEATABLE_READ" | "SERIALIZABLE";
  readonly correlationId: string;
}

export interface DurableDocumentPersistenceInput {
  readonly context: PostgresTransactionContext;
  readonly documentId: string;
  readonly from: DocumentLifecycle;
  readonly to: DocumentLifecycle;
  readonly artifact?: DocumentArtifact;
  readonly binding?: DocumentBinding;
  readonly numberingReservation?: NumberingReservation;
  readonly numberingRegister?: NumberingRegister;
  readonly audit: DocumentAuditEvent;
  readonly idempotencyKey: string;
  readonly requestFingerprint: string;
}

export interface DurableDocumentPersistenceAdapter {
  /** The implementation must commit all supplied state atomically or commit none. */
  executeAtomic(input: DurableDocumentPersistenceInput): Promise<void>;
}

export interface PersistenceConcurrencyContract {
  /** Document lifecycle must be checked against the persisted current state. */
  readonly optimisticLifecycleCheck: true;
  /** Number allocation/register commit must be serialized per numbering scope. */
  readonly serializedNumberingCommit: true;
  /** Idempotency key + fingerprint must be unique and atomically reserved. */
  readonly atomicIdempotencyReservation: true;
  /** Outbox creation must share the business transaction with its state change. */
  readonly atomicOutboxLinkage: true;
}

export const POSTGRES_PERSISTENCE_CONCURRENCY_CONTRACT: PersistenceConcurrencyContract = Object.freeze({
  optimisticLifecycleCheck: true,
  serializedNumberingCommit: true,
  atomicIdempotencyReservation: true,
  atomicOutboxLinkage: true,
});

export const assertPersistenceTransactionContext = (context: PostgresTransactionContext): void => {
  if (!context.transactionId.trim()) throw new Error("INVALID_TRANSACTION_ID");
  if (!context.correlationId.trim()) throw new Error("INVALID_CORRELATION_ID");
  if (context.isolationLevel !== "READ_COMMITTED" && context.isolationLevel !== "REPEATABLE_READ" && context.isolationLevel !== "SERIALIZABLE") {
    throw new Error("INVALID_TRANSACTION_ISOLATION_LEVEL");
  }
};
