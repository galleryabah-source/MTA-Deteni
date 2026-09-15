import type { AuditEvent } from "../../domain/shared/contracts.js";
import type { OperationalOutbox } from "../../application/p11-961-1024-transactional-mutation.js";
import type { TransactionContextMetadata, SharedTransactionContext, GovernedTransactionRunner } from "../../application/p12-121-160-shared-transaction-context.js";
import type { IdempotencyRecord, PersistentIdempotencyPort } from "../../application/p12-161-200-persistent-idempotency-contract.js";

export type TransactionJournal = Readonly<{
  transactionId: string;
  audits: readonly AuditEvent[];
  outbox: readonly OperationalOutbox[];
  idempotency: readonly IdempotencyRecord[];
}>;

/** Controlled non-production unit-of-work. It stages side effects and commits them together. */
export class InMemoryGovernedTransaction implements GovernedTransactionRunner {
  private readonly committedAudits: AuditEvent[] = [];
  private readonly committedOutbox: OperationalOutbox[] = [];
  private readonly committedIdempotency = new Map<string, IdempotencyRecord>();

  async run<T>(metadata: TransactionContextMetadata, work: (context: SharedTransactionContext) => Promise<T>): Promise<T> {
    const stagedAudits: AuditEvent[] = [];
    const stagedOutbox: OperationalOutbox[] = [];
    const stagedIdempotency = new Map<string, IdempotencyRecord>();
    const context: SharedTransactionContext = {
      metadata,
      persistAudit: async (event) => { stagedAudits.push(event); },
      persistOutbox: async (message) => { stagedOutbox.push(message); },
      completeIdempotency: async (key, fingerprint, result) => {
        const existing = this.committedIdempotency.get(key) ?? stagedIdempotency.get(key);
        if (!existing || existing.fingerprint !== fingerprint) throw new Error("IDEMPOTENCY_RECORD_REQUIRED");
        stagedIdempotency.set(key, { ...existing, state: "COMPLETED", result });
      },
    };
    try {
      const result = await work(context);
      for (const event of stagedAudits) this.committedAudits.push(event);
      for (const message of stagedOutbox) this.committedOutbox.push(message);
      for (const [key, record] of stagedIdempotency) this.committedIdempotency.set(key, record);
      return result;
    } catch (error) {
      throw error;
    }
  }

  journal(transactionId: string): TransactionJournal {
    return { transactionId, audits: [...this.committedAudits], outbox: [...this.committedOutbox], idempotency: [...this.committedIdempotency.values()] };
  }
}

export class InMemoryPersistentIdempotency implements PersistentIdempotencyPort {
  private readonly records = new Map<string, IdempotencyRecord>();

  async acquire(key: string, fingerprint: string, actorId: string, correlationId: string, aggregateId: string): Promise<"ACQUIRED" | "REPLAY" | "CONFLICT"> {
    const existing = this.records.get(key);
    if (!existing) {
      this.records.set(key, { key, fingerprint, actorId, correlationId, aggregateId, state: "IN_PROGRESS" });
      return "ACQUIRED";
    }
    if (existing.fingerprint !== fingerprint || existing.actorId !== actorId || existing.correlationId !== correlationId || existing.aggregateId !== aggregateId) return "CONFLICT";
    return existing.state === "COMPLETED" ? "REPLAY" : "CONFLICT";
  }

  async get(key: string): Promise<IdempotencyRecord | null> { return this.records.get(key) ?? null; }

  async complete(key: string, result: Readonly<Record<string, unknown>>): Promise<void> {
    const existing = this.records.get(key);
    if (!existing) throw new Error("IDEMPOTENCY_RECORD_REQUIRED");
    this.records.set(key, { ...existing, state: "COMPLETED", result });
  }

  snapshot(): readonly IdempotencyRecord[] { return [...this.records.values()]; }
}
