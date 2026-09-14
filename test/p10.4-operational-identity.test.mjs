import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOperationalIdentity, resolveOperationalIdentity, assertIdentityCannotAuthorize } from '../src/domain/operational-identity.mjs';
import { executeIdentityScan } from '../src/application/operational-identity-command.mjs';
import { TransactionalKernelStore } from '../src/kernel/transactional-command.mjs';

const auth = {
  auth: { userId: 'synthetic-officer', sessionId: 'synthetic-session', active: true },
  permissions: ['deteni.identity.scan'], allowedScopes: ['UNIT-A'],
  operationalAssignment: 'DETENTION-OFFICER', requiredAssignment: 'DETENTION-OFFICER',
  dutyActive: true, classificationAllowed: true, resourceExists: true,
  stateValid: true, policyAllowed: true, isSuperAdmin: false, superAdminOperationalBypass: false,
};
const registry = {
  'QR:opaque-token-001': { detaineeId: 'synthetic-detainee-001', placementId: 'placement-001', active: true },
};

test('P10.4-IDENTITY-001: barcode/QR token is normalized as opaque operational identity', () => {
  const value = normalizeOperationalIdentity({ identityType: 'QR', opaqueToken: 'opaque-token-001', requestId: 'req-401', correlationId: 'corr-401' });
  assert.equal(value.provenance, 'SCANNED_INPUT');
  assert.equal(value.opaqueToken, 'opaque-token-001');
});

test('P10.4-IDENTITY-002: identity resolution does not grant authorization', () => {
  const result = resolveOperationalIdentity(registry, { identityType: 'QR', opaqueToken: 'opaque-token-001', requestId: 'req-402', correlationId: 'corr-402' });
  assert.equal(result.status, 'RESOLVED');
  assert.equal(result.authorizationGranted, undefined);
  assert.doesNotThrow(() => assertIdentityCannotAuthorize(result));
});

test('P10.4-IDENTITY-003: unknown token is fail-closed', () => {
  const result = resolveOperationalIdentity(registry, { identityType: 'BARCODE', opaqueToken: 'opaque-token-999', requestId: 'req-403', correlationId: 'corr-403' });
  assert.equal(result.status, 'NOT_FOUND');
});

test('P10.4-IDENTITY-004: malformed identity is rejected', () => {
  assert.throws(() => normalizeOperationalIdentity({ identityType: 'QR', opaqueToken: 'short', requestId: 'req-404', correlationId: 'corr-404' }), /IDENTITY_TOKEN_INVALID/);
  assert.throws(() => normalizeOperationalIdentity({ identityType: 'QR', opaqueToken: 'detainee-123456', requestId: 'req-405', correlationId: 'corr-405' }), /IDENTITY_TOKEN_MUST_BE_OPAQUE/);
});

test('P10.4-IDENTITY-005: authorized scan commits audit and outbox atomically', () => {
  const store = new TransactionalKernelStore();
  const result = executeIdentityScan({ authContext: auth, identityType: 'QR', opaqueToken: 'opaque-token-001', actorId: 'synthetic-officer', scope: 'UNIT-A', requestId: 'req-406', correlationId: 'corr-406', idempotencyKey: 'idem-406', registry, store });
  assert.equal(result.status, 'COMMITTED');
  const snapshot = store.snapshot();
  assert.equal(snapshot.auditCount, 1); assert.equal(snapshot.outbox.length, 1); assert.equal(snapshot.idempotencyCount, 1);
});

test('P10.4-IDENTITY-006: unauthorized scan creates no side effects', () => {
  const store = new TransactionalKernelStore();
  const result = executeIdentityScan({ authContext: { ...auth, dutyActive: false }, identityType: 'QR', opaqueToken: 'opaque-token-001', actorId: 'synthetic-officer', scope: 'UNIT-A', requestId: 'req-407', correlationId: 'corr-407', idempotencyKey: 'idem-407', registry, store });
  assert.equal(result.status, 'DENIED');
  assert.deepEqual(store.snapshot(), { domain: {}, auditCount: 0, outbox: [], idempotencyCount: 0 });
});

test('P10.4-IDENTITY-007: replay does not duplicate scan side effects', () => {
  const store = new TransactionalKernelStore();
  const input = { authContext: auth, identityType: 'QR', opaqueToken: 'opaque-token-001', actorId: 'synthetic-officer', scope: 'UNIT-A', requestId: 'req-408', correlationId: 'corr-408', idempotencyKey: 'idem-408', registry, store };
  assert.equal(executeIdentityScan(input).status, 'COMMITTED');
  assert.equal(executeIdentityScan(input).status, 'REPLAY');
  const snapshot = store.snapshot();
  assert.equal(snapshot.auditCount, 1); assert.equal(snapshot.outbox.length, 1);
});
