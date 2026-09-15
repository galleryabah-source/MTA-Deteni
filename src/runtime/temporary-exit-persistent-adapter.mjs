import { TransactionalKernelStore } from '../kernel/transactional-command.mjs';
import { fingerprint } from '../kernel/idempotency.mjs';
import { assertTemporaryExitPersistenceAdapter } from '../application/temporary-exit-persistence-readiness.mjs';

/**
 * Adapter-neutral persistence implementation used only by synthetic tests.
 * It deliberately has no PostgreSQL dependency and must never be treated as a
 * production persistence adapter.
 */
export function createSyntheticTemporaryExitPersistentAdapter({ scopeResolver = () => true } = {}) {
  const store = new TransactionalKernelStore();
  const records = new Map();

  const adapter = {
    transaction(work) {
      if (typeof work !== 'function') throw new Error('TRANSACTION_CALLBACK_REQUIRED');
      return work(adapter);
    },
    checkIdempotency({ idempotencyKey, request }) {
      if (!idempotencyKey?.trim()) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
      return { fingerprint: fingerprint(request), key: idempotencyKey };
    },
    appendAudit(event) {
      if (!event?.eventId || !event?.actorId || !event?.scopeId) throw new Error('AUDIT_EVENT_CONTEXT_REQUIRED');
      return Object.freeze({ ...event });
    },
    appendOutbox(event) {
      if (!event?.eventId || !event?.type) throw new Error('OUTBOX_EVENT_REQUIRED');
      return Object.freeze({ ...event, status: 'PENDING' });
    },
    assertScope(actorId, scopeId) {
      if (!actorId || !scopeId || !scopeResolver(actorId, scopeId)) throw new Error('SCOPE_DENIED');
      return true;
    },
    getById(id) {
      return records.get(id) ?? null;
    },
    save(id, value) {
      if (!id) throw new Error('RESOURCE_ID_REQUIRED');
      records.set(id, structuredClone(value));
      return records.get(id);
    },
    executeCriticalCommand({ idempotencyKey, request, resourceId, mutation, auditEvent, outboxEvent }) {
      adapter.assertScope(request.actorId, request.scope);
      const result = store.command({
        idempotencyKey,
        request: { ...request, resourceId },
        domainMutation: ({ set }) => {
          const current = records.get(resourceId) ?? null;
          const next = mutation(current);
          set(resourceId, structuredClone(next));
          records.set(resourceId, structuredClone(next));
        },
        auditEvent,
        outboxEvent,
      });
      return result;
    },
    snapshot() {
      return { records: structuredClone(Object.fromEntries(records)), kernel: store.snapshot() };
    },
  };

  return assertTemporaryExitPersistenceAdapter({ ...adapter });
}
