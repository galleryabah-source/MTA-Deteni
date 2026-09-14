import { createArtifactHandoff, consumeArtifactHandoff, verifyArtifactBinding } from '../domain/artifact-handoff.mjs';

export const ARTIFACT_DOWNLOAD_PERMISSION = 'deteni.document.artifact.download';

function required(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${name} is required`);
  return value.trim();
}

function deny(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

export function requestArtifactDownload({ document, requestContext, authorize, storage, audit, outbox, now = new Date(), ttlMs = 60_000 }) {
  required(requestContext?.actorId, 'requestContext.actorId');
  required(requestContext?.scopeId, 'requestContext.scopeId');
  required(requestContext?.sessionId, 'requestContext.sessionId');
  required(requestContext?.correlationId, 'requestContext.correlationId');
  if (typeof authorize !== 'function') throw new Error('authorize is required');
  if (!storage || typeof storage.getMetadata !== 'function') throw new Error('private storage adapter is required');
  if (typeof audit !== 'function' || typeof outbox !== 'function') throw new Error('audit and outbox adapters are required');

  const decision = authorize({
    auth: { userId: requestContext.actorId, sessionId: requestContext.sessionId, active: requestContext.active === true },
    permission: ARTIFACT_DOWNLOAD_PERMISSION,
    permissions: requestContext.permissions ?? [],
    scope: requestContext.scopeId,
    allowedScopes: requestContext.allowedScopes ?? [],
    operationalAssignment: requestContext.operationalAssignment ?? null,
    requiredAssignment: requestContext.requiredAssignment,
    dutyActive: requestContext.dutyActive === true,
    classificationAllowed: requestContext.classificationAllowed === true,
    resourceExists: Boolean(document),
    stateValid: document?.state === 'ISSUED',
    policyAllowed: requestContext.policyAllowed === true,
    isSuperAdmin: requestContext.isSuperAdmin === true,
    superAdminOperationalBypass: requestContext.superAdminOperationalBypass === true,
  });
  if (!decision.allowed) deny(decision.reasonCode);

  if (!document || document.state !== 'ISSUED') deny('DOCUMENT_NOT_ISSUED');
  required(document.artifactId, 'document.artifactId');
  required(document.artifactSha256, 'document.artifactSha256');
  required(document.objectId, 'document.objectId');

  const metadata = storage.getMetadata(document.objectId, {
    actorId: requestContext.actorId,
    scopeId: requestContext.scopeId,
    allowedClassifications: requestContext.allowedClassifications ?? [],
  });
  if (metadata.status !== 'AVAILABLE') deny('STORAGE_OBJECT_NOT_AVAILABLE');
  if (metadata.checksumSha256 !== document.artifactSha256) deny('ARTIFACT_CHECKSUM_MISMATCH');

  const handoff = createArtifactHandoff({ document, objectId: metadata.objectId, actorId: requestContext.actorId, scopeId: requestContext.scopeId, now, ttlMs });

  // Production adapters MUST call audit/outbox inside the same critical transaction.
  // Provider/storage network calls are deliberately absent from this transaction boundary.
  audit({ eventType: 'ARTIFACT_DOWNLOAD_GRANT_ISSUED', aggregateType: 'DOCUMENT', aggregateId: document.documentId, actorId: requestContext.actorId, scopeId: requestContext.scopeId, correlationId: requestContext.correlationId, payload: { grantId: handoff.grantId, artifactId: handoff.artifactId, objectId: handoff.objectId } });
  outbox({ eventType: 'ARTIFACT_DOWNLOAD_GRANT_ISSUED', aggregateType: 'DOCUMENT', aggregateId: document.documentId, correlationId: requestContext.correlationId, payload: { grantId: handoff.grantId, artifactId: handoff.artifactId, objectId: handoff.objectId } });

  return Object.freeze({ handoff });
}

/** Execute only after an outbox worker has durably claimed a committed event. */
export function executeArtifactProviderHandoff({ handoff, requestContext, storage, now = Date.now(), ttlMs = 60_000 }) {
  required(requestContext?.actorId, 'requestContext.actorId');
  required(requestContext?.scopeId, 'requestContext.scopeId');
  if (!handoff || handoff.status !== 'ACTIVE') deny('DOWNLOAD_GRANT_NOT_ACTIVE');
  if (handoff.actorId !== requestContext.actorId) deny('DOWNLOAD_GRANT_ACTOR_MISMATCH');
  if (handoff.scopeId !== requestContext.scopeId) deny('DOWNLOAD_GRANT_SCOPE_MISMATCH');
  if (typeof storage?.createTemporaryDownload !== 'function') throw new Error('private storage adapter is required');
  return storage.createTemporaryDownload(handoff.objectId, { actorId: requestContext.actorId, scopeId: requestContext.scopeId, allowedClassifications: requestContext.allowedClassifications ?? [] }, now, ttlMs);
}

export function consumeArtifactDownload({ handoff, requestContext, document, storage, audit, now = new Date() }) {
  required(requestContext?.actorId, 'requestContext.actorId');
  required(requestContext?.scopeId, 'requestContext.scopeId');
  if (!verifyArtifactBinding(handoff, { documentId: document?.documentId, artifactId: document?.artifactId, artifactSha256: document?.artifactSha256, objectId: document?.objectId })) deny('ARTIFACT_BINDING_MISMATCH');
  const consumed = consumeArtifactHandoff(handoff, { actorId: requestContext.actorId, scopeId: requestContext.scopeId, objectId: document.objectId, now });
  if (typeof storage?.consumeTemporaryDownload !== 'function') throw new Error('private storage adapter is required');
  const content = storage.consumeTemporaryDownload(handoff.grantId, { actorId: requestContext.actorId, scopeId: requestContext.scopeId, allowedClassifications: requestContext.allowedClassifications ?? [] }, now.getTime());
  if (typeof audit === 'function') audit({ eventType: 'ARTIFACT_DOWNLOAD_COMPLETED', aggregateType: 'DOCUMENT', aggregateId: document.documentId, actorId: requestContext.actorId, scopeId: requestContext.scopeId, correlationId: requestContext.correlationId, payload: { grantId: handoff.grantId, artifactId: handoff.artifactId, objectId: handoff.objectId } });
  return Object.freeze({ consumed, content });
}
