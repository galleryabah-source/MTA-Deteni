import type { ActorContext, AuditEvent, DomainName } from "../domain/shared/contracts.js";
import type { OperationalOutbox } from "./p11-961-1024-transactional-mutation.js";

export type TransactionContextMetadata = Readonly<{
  transactionId: string;
  actorId: string;
  correlationId: string;
  aggregateId: string;
}>;

export type SharedTransactionContext = Readonly<{
  metadata: TransactionContextMetadata;
  persistAudit(event: AuditEvent): Promise<void>;
  persistOutbox(message: OperationalOutbox): Promise<void>;
  completeIdempotency(key: string, fingerprint: string, result: Readonly<Record<string, unknown>>): Promise<void>;
}>;

export type GovernedTransactionRunner = Readonly<{
  run<T>(metadata: TransactionContextMetadata, work: (context: SharedTransactionContext) => Promise<T>): Promise<T>;
}>;

export function buildTransactionContextMetadata(actor: ActorContext, aggregateId: string, transactionId: string): TransactionContextMetadata {
  if (!actor.actorId.trim() || !actor.correlationId.trim()) throw new Error("ACTOR_CONTEXT_REQUIRED");
  if (!aggregateId.trim()) throw new Error("AGGREGATE_ID_REQUIRED");
  if (!transactionId.trim()) throw new Error("TRANSACTION_ID_REQUIRED");
  return { transactionId, actorId: actor.actorId, correlationId: actor.correlationId, aggregateId };
}

export function validateSharedTransactionContext(context: SharedTransactionContext, expectedDomain: DomainName | null = null): "READY" | "BLOCKED" {
  const { metadata } = context;
  if (!metadata.transactionId.trim() || !metadata.actorId.trim() || !metadata.correlationId.trim() || !metadata.aggregateId.trim()) return "BLOCKED";
  if (expectedDomain !== null && !expectedDomain.trim()) return "BLOCKED";
  return "READY";
}

export function assertSameTransactionIdentity(metadata: TransactionContextMetadata, event: AuditEvent, outbox: OperationalOutbox): void {
  if (event.actorId !== metadata.actorId) throw new Error("TRANSACTION_AUDIT_ACTOR_MISMATCH");
  if (event.correlationId !== metadata.correlationId) throw new Error("TRANSACTION_AUDIT_CORRELATION_MISMATCH");
  if (event.aggregateId !== metadata.aggregateId) throw new Error("TRANSACTION_AUDIT_AGGREGATE_MISMATCH");
  if (outbox.aggregateId !== metadata.aggregateId) throw new Error("TRANSACTION_OUTBOX_AGGREGATE_MISMATCH");
}
