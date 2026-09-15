import { randomUUID } from 'node:crypto';

const STATUS = Object.freeze({ ACTIVE: 'ACTIVE', REVOKED: 'REVOKED', CONSUMED: 'CONSUMED' });

function required(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${name} is required`);
  return value.trim();
}

export function createArtifactHandoff({ document, objectId, actorId, scopeId, now = new Date(), ttlMs = 5 * 60 * 1000 }) {
  if (!document || document.state !== 'ISSUED') throw new Error('Document must be ISSUED');
  required(document.artifactId, 'document.artifactId');
  required(document.artifactSha256, 'document.artifactSha256');
  const object = required(objectId, 'objectId');
  const actor = required(actorId, 'actorId');
  const scope = required(scopeId, 'scopeId');
  if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) throw new Error('ttlMs must be positive');
  const issuedAt = new Date(now).toISOString();
  const expiresAt = new Date(new Date(now).getTime() + ttlMs).toISOString();
  return Object.freeze({
    grantId: randomUUID(),
    documentId: document.documentId,
    artifactId: document.artifactId,
    artifactSha256: document.artifactSha256,
    objectId: object,
    actorId: actor,
    scopeId: scope,
    issuedAt,
    expiresAt,
    status: STATUS.ACTIVE,
    singleUse: true,
  });
}

export function consumeArtifactHandoff(grant, { actorId, scopeId, objectId, now = new Date() }) {
  if (!grant || grant.status !== STATUS.ACTIVE) throw new Error('Download grant is not active');
  if (grant.singleUse !== true) throw new Error('Download grant is not single-use');
  if (grant.actorId !== required(actorId, 'actorId')) throw new Error('Actor is not authorized for grant');
  if (grant.scopeId !== required(scopeId, 'scopeId')) throw new Error('Scope is not authorized for grant');
  if (grant.objectId !== required(objectId, 'objectId')) throw new Error('Object identity mismatch');
  if (new Date(now).getTime() >= new Date(grant.expiresAt).getTime()) throw new Error('Download grant expired');
  return Object.freeze({ ...grant, status: STATUS.CONSUMED, consumedAt: new Date(now).toISOString() });
}

export function revokeArtifactHandoff(grant, { actorId, scopeId, now = new Date() }) {
  if (!grant || grant.status !== STATUS.ACTIVE) throw new Error('Download grant is not active');
  if (grant.actorId !== required(actorId, 'actorId')) throw new Error('Actor is not authorized for grant');
  if (grant.scopeId !== required(scopeId, 'scopeId')) throw new Error('Scope is not authorized for grant');
  return Object.freeze({ ...grant, status: STATUS.REVOKED, revokedAt: new Date(now).toISOString() });
}

export function verifyArtifactBinding(grant, { documentId, artifactId, artifactSha256, objectId }) {
  return Boolean(
    grant &&
    grant.documentId === documentId &&
    grant.artifactId === artifactId &&
    grant.artifactSha256 === artifactSha256 &&
    grant.objectId === objectId,
  );
}

export const ARTIFACT_HANDOFF_STATUS = STATUS;
