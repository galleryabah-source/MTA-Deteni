import { createHash } from 'node:crypto';

export function fingerprint(input) {
  const canonical = JSON.stringify({
    operation: input.operation,
    actorId: input.actorId,
    scope: input.scope,
    resourceId: input.resourceId ?? null,
    payload: input.payload ?? null,
  });
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

export class IdempotencyStore {
  #records = new Map();

  execute(key, request, handler) {
    if (!key?.trim()) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
    const fp = fingerprint(request);
    const existing = this.#records.get(key);
    if (existing) {
      if (existing.fingerprint !== fp) {
        return { status: 'CONFLICT', reasonCode: 'IDEMPOTENCY_KEY_REUSE' };
      }
      return { status: 'REPLAY', fingerprint: fp, result: existing.result };
    }
    const result = handler();
    this.#records.set(key, Object.freeze({ fingerprint: fp, result }));
    return { status: 'EXECUTED', fingerprint: fp, result };
  }
}
