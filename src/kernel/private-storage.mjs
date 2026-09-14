import { createHash, randomUUID } from 'node:crypto';

const STATES = new Set(['QUARANTINED', 'AVAILABLE', 'REVOKED', 'ARCHIVED', 'EXPIRED', 'DESTROYED']);
const CLASSES = new Set(['INTAKE_ORIGINAL', 'EXTRACTION_ARTIFACT', 'OFFICIAL_TEMPLATE', 'GENERATED_DOCUMENT', 'EVIDENCE', 'EXPORT_ARTIFACT', 'SYSTEM_ARTIFACT']);
const CLASSIFICATIONS = new Set(['L1', 'L2', 'L3', 'L4']);

function assertAccess(context, metadata, purpose = 'VIEW') {
  if (!context?.actorId?.trim() || !context?.scopeId?.trim()) throw new Error('STORAGE_ACCESS_CONTEXT_REQUIRED');
  if (context.scopeId !== metadata.scopeId) throw new Error('STORAGE_SCOPE_DENIED');
  if (!Array.isArray(context.allowedClassifications) || !context.allowedClassifications.includes(metadata.classification)) throw new Error('STORAGE_CLASSIFICATION_DENIED');
  if (metadata.status !== 'AVAILABLE') throw new Error('STORAGE_OBJECT_STATE_DENIED');
  if (!purpose?.trim()) throw new Error('STORAGE_PURPOSE_REQUIRED');
  return true;
}

export function buildStorageKey({ environment, objectClass, scopeId, objectId = randomUUID(), randomName = randomUUID() }) {
  for (const value of [environment, objectClass, scopeId, objectId, randomName]) {
    if (typeof value !== 'string' || !value || /(?:\.\.|[\\/\0\r\n])/.test(value)) throw new Error('STORAGE_KEY_INPUT_INVALID');
  }
  if (!CLASSES.has(objectClass)) throw new Error('STORAGE_CLASS_INVALID');
  return `mta-deteni/${environment}/${objectClass}/${scopeId}/${new Date().getUTCFullYear()}/${String(new Date().getUTCMonth() + 1).padStart(2, '0')}/${objectId}/${randomName}`;
}

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export class PrivateStorageTestDouble {
  #objects = new Map();
  #metadata = new Map();
  #grants = new Map();
  #audit = [];

  put({ content, environment = 'test', objectClass, scopeId, originalFilename, detectedMimeType, classification, sourceType, sourceId, correlationId, uploadedBy }) {
    if (!Buffer.isBuffer(content)) throw new Error('STORAGE_CONTENT_REQUIRED');
    if (!CLASSES.has(objectClass)) throw new Error('STORAGE_CLASS_INVALID');
    if (!scopeId?.trim()) throw new Error('STORAGE_SCOPE_REQUIRED');
    if (!CLASSIFICATIONS.has(classification)) throw new Error('STORAGE_CLASSIFICATION_INVALID');
    if (!correlationId?.trim()) throw new Error('STORAGE_CORRELATION_REQUIRED');
    const objectId = randomUUID();
    const storageKey = buildStorageKey({ environment, objectClass, scopeId, objectId });
    const checksumSha256 = sha256(content);
    const metadata = Object.freeze({ objectId, storageKey, objectClass, scopeId, originalFilename, detectedMimeType, sizeBytes: content.byteLength, checksumSha256, classification, sourceType, sourceId, correlationId, uploadedBy, uploadedAt: new Date().toISOString(), status: 'QUARANTINED' });
    this.#objects.set(objectId, Buffer.from(content));
    this.#metadata.set(objectId, metadata);
    this.#audit.push({ event: 'STORAGE_QUARANTINED', objectId, correlationId });
    return metadata;
  }

  makeAvailable(objectId) {
    const metadata = this.#metadata.get(objectId);
    if (!metadata) throw new Error('STORAGE_OBJECT_NOT_FOUND');
    if (metadata.status !== 'QUARANTINED') throw new Error('STORAGE_STATE_INVALID');
    const next = Object.freeze({ ...metadata, status: 'AVAILABLE' });
    this.#metadata.set(objectId, next);
    this.#audit.push({ event: 'STORAGE_AVAILABLE', objectId, correlationId: metadata.correlationId });
    return next;
  }

  getMetadata(objectId, context) {
    const metadata = this.#metadata.get(objectId);
    if (!metadata) throw new Error('STORAGE_OBJECT_NOT_FOUND');
    assertAccess(context, metadata);
    this.#audit.push({ event: 'STORAGE_VIEW_REQUESTED', objectId, actorId: context.actorId, correlationId: metadata.correlationId });
    return metadata;
  }

  createTemporaryDownload(objectId, context, now = Date.now(), ttlMs = 60_000) {
    const metadata = this.#metadata.get(objectId);
    if (!metadata) throw new Error('STORAGE_OBJECT_NOT_FOUND');
    assertAccess(context, metadata, 'DOWNLOAD');
    if (!Number.isInteger(ttlMs) || ttlMs < 1 || ttlMs > 300_000) throw new Error('STORAGE_GRANT_TTL_INVALID');
    const grantId = randomUUID();
    this.#grants.set(grantId, { grantId, objectId, actorId: context.actorId, purpose: 'DOWNLOAD', expiresAt: now + ttlMs, used: false });
    this.#audit.push({ event: 'STORAGE_DOWNLOAD_GRANTED', objectId, actorId: context.actorId, correlationId: metadata.correlationId });
    return Object.freeze({ grantId, expiresAt: now + ttlMs });
  }

  consumeTemporaryDownload(grantId, context, now = Date.now()) {
    const grant = this.#grants.get(grantId);
    if (!grant || grant.used || grant.expiresAt <= now || grant.actorId !== context?.actorId) throw new Error('STORAGE_DOWNLOAD_GRANT_DENIED');
    const metadata = this.#metadata.get(grant.objectId);
    if (!metadata) throw new Error('STORAGE_OBJECT_NOT_FOUND');
    assertAccess(context, metadata, grant.purpose);
    grant.used = true;
    this.#audit.push({ event: 'STORAGE_DOWNLOAD_COMPLETED', objectId: metadata.objectId, actorId: context.actorId, correlationId: metadata.correlationId });
    return Buffer.from(this.#objects.get(metadata.objectId));
  }

  verifyIntegrity(objectId) {
    const metadata = this.#metadata.get(objectId);
    const content = this.#objects.get(objectId);
    if (!metadata || !content) return { ok: false, reason: 'STORAGE_OBJECT_MISSING' };
    const actual = sha256(content);
    const ok = actual === metadata.checksumSha256 && content.byteLength === metadata.sizeBytes;
    this.#audit.push({ event: ok ? 'STORAGE_INTEGRITY_CHECK' : 'STORAGE_INTEGRITY_FAILURE', objectId, correlationId: metadata.correlationId });
    return { ok, expectedChecksum: metadata.checksumSha256, actualChecksum: actual };
  }

  revoke(objectId, reason) {
    const metadata = this.#metadata.get(objectId);
    if (!metadata) throw new Error('STORAGE_OBJECT_NOT_FOUND');
    const next = Object.freeze({ ...metadata, status: 'REVOKED', revokeReason: reason });
    this.#metadata.set(objectId, next);
    this.#audit.push({ event: 'STORAGE_REVOKED', objectId, correlationId: metadata.correlationId });
    return next;
  }

  auditEvents() { return [...this.#audit]; }
}
