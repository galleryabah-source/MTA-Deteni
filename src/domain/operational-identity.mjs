const IDENTITY_TYPES = new Set(['BARCODE', 'QR']);

function requiredString(input, key, code) {
  if (typeof input?.[key] !== 'string' || !input[key].trim()) throw new Error(code);
}

export function normalizeOperationalIdentity(input) {
  requiredString(input, 'identityType', 'IDENTITY_TYPE_REQUIRED');
  if (!IDENTITY_TYPES.has(input.identityType)) throw new Error('IDENTITY_TYPE_INVALID');
  requiredString(input, 'opaqueToken', 'IDENTITY_TOKEN_REQUIRED');
  requiredString(input, 'requestId', 'IDENTITY_REQUEST_REQUIRED');
  requiredString(input, 'correlationId', 'IDENTITY_CORRELATION_REQUIRED');

  if (input.opaqueToken.length < 8 || input.opaqueToken.length > 256) throw new Error('IDENTITY_TOKEN_INVALID');
  if (input.opaqueToken.includes('detainee') || input.opaqueToken.includes('nik') || input.opaqueToken.includes('passport')) {
    throw new Error('IDENTITY_TOKEN_MUST_BE_OPAQUE');
  }

  return Object.freeze({
    identityType: input.identityType,
    opaqueToken: input.opaqueToken,
    requestId: input.requestId,
    correlationId: input.correlationId,
    provenance: 'SCANNED_INPUT',
  });
}

export function resolveOperationalIdentity(registry, input) {
  const normalized = normalizeOperationalIdentity(input);
  if (!registry || typeof registry !== 'object') throw new Error('IDENTITY_REGISTRY_INVALID');
  const match = registry[`${normalized.identityType}:${normalized.opaqueToken}`];
  if (!match) return Object.freeze({ status: 'NOT_FOUND', identity: normalized });
  return Object.freeze({
    status: 'RESOLVED',
    identity: normalized,
    detaineeId: match.detaineeId,
    placementId: match.placementId ?? null,
    active: match.active === true,
  });
}

export function assertIdentityCannotAuthorize(resolution) {
  if (resolution?.authorizationGranted === true || resolution?.isAuthorized === true) {
    throw new Error('IDENTITY_MUST_NOT_AUTHORIZE');
  }
  return true;
}
