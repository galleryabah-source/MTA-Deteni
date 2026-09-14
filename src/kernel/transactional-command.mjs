import { fingerprint } from './idempotency.mjs';

/**
 * Dependency-free executable model of the P9.8 critical transaction boundary.
 * This is deliberately an in-memory test double: it proves ordering/rollback
 * semantics without introducing a schema migration or production DB access.
 */
export class TransactionalKernelStore {
  #domain = new Map();
  #audit = [];
  #outbox = new Map();
  #idempotency = new Map();
  #failure = null;

  injectFailure(stage) {
    this.#failure = stage;
  }

  command({ idempotencyKey, request, domainMutation, auditEvent, outboxEvent }) {
    if (!idempotencyKey?.trim()) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
    const fp = fingerprint(request);
    const prior = this.#idempotency.get(idempotencyKey);
    if (prior) {
      if (prior !== fp) return { status: 'CONFLICT', reasonCode: 'IDEMPOTENCY_KEY_REUSE' };
      return { status: 'REPLAY' };
    }

    const domainSnapshot = new Map(this.#domain);
    const auditSnapshot = [...this.#audit];
    const outboxSnapshot = new Map(this.#outbox);

    try {
      domainMutation({ set: (key, value) => this.#domain.set(key, value) });
      if (this.#failure === 'DOMAIN') throw new Error('INJECTED_DOMAIN_FAILURE');

      this.#audit.push(Object.freeze({ ...auditEvent }));
      if (this.#failure === 'AUDIT') throw new Error('INJECTED_AUDIT_FAILURE');

      if (this.#failure === 'OUTBOX') throw new Error('INJECTED_OUTBOX_FAILURE');
      if (this.#outbox.has(outboxEvent.eventId)) throw new Error('OUTBOX_DUPLICATE_EVENT');
      this.#outbox.set(outboxEvent.eventId, Object.freeze({ ...outboxEvent, status: 'PENDING' }));

      if (this.#failure === 'COMMIT') throw new Error('INJECTED_COMMIT_FAILURE');
      this.#idempotency.set(idempotencyKey, fp);
      this.#failure = null;
      return { status: 'COMMITTED', eventId: outboxEvent.eventId };
    } catch (error) {
      this.#domain = domainSnapshot;
      this.#audit = auditSnapshot;
      this.#outbox = outboxSnapshot;
      throw error;
    } finally {
      this.#failure = null;
    }
  }

  snapshot() {
    return {
      domain: Object.fromEntries(this.#domain),
      auditCount: this.#audit.length,
      outbox: [...this.#outbox.values()],
      idempotencyCount: this.#idempotency.size,
    };
  }
}
