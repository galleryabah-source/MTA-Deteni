import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const TOKEN_VERSION = 'mta-oi.v1';

function base64urlEncode(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64urlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function canonicalPayload(payload) {
  return JSON.stringify({
    v: payload.v,
    typ: payload.typ,
    ref: payload.ref,
    purpose: payload.purpose,
    iat: payload.iat,
    exp: payload.exp,
    nonce: payload.nonce,
  });
}

function sign(encodedPayload, secret) {
  return createHmac('sha256', secret).update(encodedPayload, 'utf8').digest('base64url');
}

function requireSecret(secret) {
  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error('Operational identity signing secret must be at least 32 characters');
  }
}

export function issueOperationalIdentity({ subjectRef, purpose, now = Date.now(), ttlMs = 15 * 60 * 1000, secret }) {
  requireSecret(secret);
  if (!subjectRef || !purpose) throw new Error('subjectRef and purpose are required');
  if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) throw new Error('ttlMs must be a positive safe integer');

  const payload = {
    v: TOKEN_VERSION,
    typ: 'operational-identity',
    ref: subjectRef,
    purpose,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + ttlMs) / 1000),
    nonce: randomBytes(16).toString('base64url'),
  };
  const encoded = base64urlEncode(canonicalPayload(payload));
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifyOperationalIdentity(token, { purpose, now = Date.now(), secret, isRevoked = () => false }) {
  requireSecret(secret);
  if (typeof token !== 'string') return { valid: false, reason: 'malformed' };

  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false, reason: 'malformed' };

  const [encoded, suppliedSignature] = parts;
  const expectedSignature = sign(encoded, secret);
  const a = Buffer.from(suppliedSignature, 'utf8');
  const b = Buffer.from(expectedSignature, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { valid: false, reason: 'invalid_signature' };
  }

  let payload;
  try {
    payload = JSON.parse(base64urlDecode(encoded));
  } catch {
    return { valid: false, reason: 'malformed' };
  }

  if (
    payload?.v !== TOKEN_VERSION ||
    payload?.typ !== 'operational-identity' ||
    typeof payload.ref !== 'string' ||
    typeof payload.purpose !== 'string' ||
    typeof payload.nonce !== 'string' ||
    !Number.isSafeInteger(payload.iat) ||
    !Number.isSafeInteger(payload.exp)
  ) {
    return { valid: false, reason: 'invalid_claims' };
  }

  if (purpose && payload.purpose !== purpose) return { valid: false, reason: 'purpose_mismatch' };
  const nowSeconds = Math.floor(now / 1000);
  if (payload.exp <= nowSeconds) return { valid: false, reason: 'expired' };
  if (payload.iat > nowSeconds + 60) return { valid: false, reason: 'issued_in_future' };
  if (isRevoked(payload.nonce)) return { valid: false, reason: 'revoked' };

  return { valid: true, payload };
}

export function generateOpaqueSubjectRef(prefix = 'deteni') {
  if (!/^[a-z0-9_-]{1,24}$/i.test(prefix)) throw new Error('Invalid subject reference prefix');
  return `${prefix}_${randomBytes(18).toString('base64url')}`;
}
