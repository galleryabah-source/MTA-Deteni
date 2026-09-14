import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateOpaqueSubjectRef,
  issueOperationalIdentity,
  verifyOperationalIdentity,
} from '../src/domain/operational-identity.mjs';

const SECRET = 'test-only-operational-identity-secret-32chars!';
const NOW = Date.parse('2026-09-14T10:00:00Z');

test('P10.4 issues opaque identity without embedding detainee PII', () => {
  const ref = generateOpaqueSubjectRef();
  const token = issueOperationalIdentity({ subjectRef: ref, purpose: 'movement', now: NOW, secret: SECRET });
  assert.match(token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.doesNotMatch(token, /name|nik|passport|dob|address|phone/i);
  const verified = verifyOperationalIdentity(token, { purpose: 'movement', now: NOW, secret: SECRET });
  assert.equal(verified.valid, true);
  assert.equal(verified.payload.ref, ref);
});

test('P10.4 rejects signature tampering', () => {
  const token = issueOperationalIdentity({ subjectRef: 'deteni_test_opaque', purpose: 'movement', now: NOW, secret: SECRET });
  const tampered = `${token.slice(0, -1)}${token.endsWith('A') ? 'B' : 'A'}`;
  assert.equal(verifyOperationalIdentity(tampered, { purpose: 'movement', now: NOW, secret: SECRET }).reason, 'invalid_signature');
});

test('P10.4 binds token to purpose', () => {
  const token = issueOperationalIdentity({ subjectRef: 'deteni_test_opaque', purpose: 'movement', now: NOW, secret: SECRET });
  assert.equal(verifyOperationalIdentity(token, { purpose: 'document', now: NOW, secret: SECRET }).reason, 'purpose_mismatch');
});

test('P10.4 rejects expired identity', () => {
  const token = issueOperationalIdentity({ subjectRef: 'deteni_test_opaque', purpose: 'movement', now: NOW, ttlMs: 1000, secret: SECRET });
  assert.equal(verifyOperationalIdentity(token, { purpose: 'movement', now: NOW + 2000, secret: SECRET }).reason, 'expired');
});

test('P10.4 supports revocation by nonce', () => {
  const token = issueOperationalIdentity({ subjectRef: 'deteni_test_opaque', purpose: 'movement', now: NOW, secret: SECRET });
  const issued = verifyOperationalIdentity(token, { purpose: 'movement', now: NOW, secret: SECRET });
  assert.equal(issued.valid, true);
  assert.equal(
    verifyOperationalIdentity(token, {
      purpose: 'movement',
      now: NOW,
      secret: SECRET,
      isRevoked: (nonce) => nonce === issued.payload.nonce,
    }).reason,
    'revoked',
  );
});

test('P10.4 fails closed when signing secret is weak', () => {
  assert.throws(
    () => issueOperationalIdentity({ subjectRef: 'deteni_test_opaque', purpose: 'movement', now: NOW, secret: 'weak' }),
    /at least 32 characters/,
  );
});
