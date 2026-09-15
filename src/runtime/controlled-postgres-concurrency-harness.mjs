/** Synthetic concurrency harness. It models the single-row atomic transition contract without opening a DB connection. */
export function createAtomicGrantHarness({ initialStatus = 'ACTIVE', now = '2026-09-15T01:00:00.000Z', expiresAt = '2026-09-15T02:00:00.000Z' } = {}) {
  let status = initialStatus;
  let consumedAt = null;
  let revokedAt = null;
  let busy = Promise.resolve();
  const serial = (work) => { const next = busy.then(work, work); busy = next.then(() => undefined, () => undefined); return next; };
  return Object.freeze({
    async consume({ actorId, scopeId, objectId, expectedActorId = actorId, expectedScopeId = scopeId, expectedObjectId = objectId, at = now } = {}) {
      return serial(async () => { if (status !== 'ACTIVE' || expiresAt <= at || actorId !== expectedActorId || scopeId !== expectedScopeId || objectId !== expectedObjectId) return { affectedRows: 0, status }; status = 'CONSUMED'; consumedAt = at; return { affectedRows: 1, status, consumedAt }; });
    },
    async revoke({ actorId, scopeId, expectedActorId = actorId, expectedScopeId = scopeId, at = now } = {}) {
      return serial(async () => { if (status !== 'ACTIVE' || actorId !== expectedActorId || scopeId !== expectedScopeId) return { affectedRows: 0, status }; status = 'REVOKED'; revokedAt = at; return { affectedRows: 1, status, revokedAt }; });
    },
    snapshot() { return Object.freeze({ status, consumedAt, revokedAt }); },
  });
}
