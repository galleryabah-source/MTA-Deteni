import { createHash, randomBytes } from 'node:crypto';

const hash = (value) => createHash('sha256').update(value).digest('hex');

/** Synthetic-only model for controlled artifact download grants. */
export function createSyntheticArtifactGrantBoundary({ now = () => Date.now() } = {}) {
  const grants = new Map();
  const snapshot = () => new Map([...grants].map(([k, v]) => [k, structuredClone(v)]));

  const boundary = {
    transaction(work) {
      if (typeof work !== 'function') throw new Error('TRANSACTION_CALLBACK_REQUIRED');
      const before = snapshot();
      try { return work(boundary); } catch (error) {
        grants.clear();
        for (const [k, v] of before) grants.set(k, v);
        throw error;
      }
    },
    issue({ artifactId, actorId, scopeId, ttlMs = 300000 } = {}) {
      if (!artifactId || !actorId || !scopeId) throw new Error('GRANT_CONTEXT_REQUIRED');
      if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) throw new Error('GRANT_TTL_INVALID');
      const token = randomBytes(24).toString('base64url');
      const grantId = randomBytes(12).toString('hex');
      grants.set(grantId, { grantId, artifactId, actorId, scopeId, tokenHash: hash(token), issuedAt: now(), expiresAt: now() + ttlMs, consumedAt: null, revokedAt: null });
      return Object.freeze({ grantId, token });
    },
    consume({ grantId, token, actorId, scopeId } = {}) {
      if (!grantId || !token || !actorId || !scopeId) throw new Error('GRANT_REQUEST_REQUIRED');
      const grant = grants.get(grantId);
      if (!grant) throw new Error('GRANT_NOT_FOUND');
      if (grant.actorId !== actorId || grant.scopeId !== scopeId) throw new Error('GRANT_SCOPE_DENIED');
      if (grant.revokedAt !== null) throw new Error('GRANT_REVOKED');
      if (grant.consumedAt !== null) throw new Error('GRANT_ALREADY_CONSUMED');
      if (now() >= grant.expiresAt) throw new Error('GRANT_EXPIRED');
      if (hash(token) !== grant.tokenHash) throw new Error('GRANT_TOKEN_INVALID');
      grant.consumedAt = now();
      return Object.freeze({ artifactId: grant.artifactId, grantId: grant.grantId, consumedAt: grant.consumedAt });
    },
    revoke({ grantId, actorId, scopeId } = {}) {
      const grant = grants.get(grantId);
      if (!grant) throw new Error('GRANT_NOT_FOUND');
      if (grant.actorId !== actorId || grant.scopeId !== scopeId) throw new Error('GRANT_SCOPE_DENIED');
      if (grant.consumedAt !== null) throw new Error('GRANT_ALREADY_CONSUMED');
      grant.revokedAt = now();
      return true;
    },
    get(grantId) { return grants.get(grantId) ?? null; },
  };
  return boundary;
}
