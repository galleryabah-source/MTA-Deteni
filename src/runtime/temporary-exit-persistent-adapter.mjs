import { TransactionalKernelStore } from '../kernel/transactional-command.mjs';
import { fingerprint } from '../kernel/idempotency.mjs';
import { assertTemporaryExitPersistenceAdapter } from '../application/temporary-exit-persistence-readiness.mjs';

/** Synthetic-only adapter: no PostgreSQL, providers, AI, or production data. */
export function createSyntheticTemporaryExitPersistentAdapter({ scopeResolver = () => true } = {}) {
  const store = new TransactionalKernelStore();
  const records = new Map();
  const save = (id, value) => {
    if (!id) throw new Error('RESOURCE_ID_REQUIRED');
    records.set(id, structuredClone(value));
    return records.get(id);
  };
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
    getById: (id) => records.get(id) ?? null,
    create: save,
    update: save,
    appendTimeline: (event) => Object.freeze({ ...event }),
    saveDocument: save,
    saveArtifactGrant: save,
    executeCriticalCommand({ idempotencyKey, request, resourceId, mutation, auditEvent, outboxEvent }) {
      adapter.assertScope(request.actorId, request.scope);
      return store.command({
        idempotencyKey,
        request: { ...request, resourceId },
        domainMutation: ({ set }) => {
          const next = structuredClone(mutation(records.get(resourceId) ?? null));
          set(resourceId, next);
          records.set(resourceId, next);
        },
        auditEvent,
        outboxEvent,
      });
    },
    snapshot() {
      return { records: structuredClone(Object.fromEntries(records)), kernel: store.snapshot() };
    },
  };
  return assertTemporaryExitPersistenceAdapter(adapter);
}
