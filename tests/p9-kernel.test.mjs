import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig, authorize, appendAuditEvent, verifyAuditChain } from '../src/kernel/p9-kernel.mjs';

test('KERNEL-CERT-008 AI-OFF core availability', () => {
  const config = loadConfig({ APP_ENV: 'test', AI_ENABLED: 'false' });
  assert.equal(config.aiEnabled, false);
  assert.equal('aiApiKey' in config, false);
});

test('KERNEL-CERT-009 production configuration fails closed', () => {
  assert.throws(() => loadConfig({ APP_ENV: 'production' }), /DATABASE_URL/);
});

const valid = {
  auth: { userId: 'u1', sessionId: 's1', active: true },
  permission: 'leave.complete', permissions: ['leave.complete'],
  scope: 'RUDENIM-01', allowedScopes: ['RUDENIM-01'],
  operationalAssignment: 'PETUGAS_JAGA', requiredAssignment: 'PETUGAS_JAGA',
  dutyActive: true, classificationAllowed: true, resourceExists: true,
  stateValid: true, policyAllowed: true, isSuperAdmin: false,
  superAdminOperationalBypass: false,
};

test('KERNEL-CERT-001/002 valid actor is allowed', () => {
  assert.deepEqual(authorize(valid), { allowed: true, reasonCode: 'ALLOW', policyVersion: 'AUTHZ-1.0' });
});

test('KERNEL-CERT-003 wrong scope is denied', () => {
  assert.equal(authorize({ ...valid, scope: 'OTHER' }).reasonCode, 'SCOPE_DENIED');
});

test('KERNEL-CERT-002 missing duty is denied', () => {
  assert.equal(authorize({ ...valid, dutyActive: false }).reasonCode, 'DUTY_INACTIVE');
});

test('KERNEL-CERT-002 Super Admin operational bypass is denied', () => {
  assert.equal(authorize({ ...valid, isSuperAdmin: true, superAdminOperationalBypass: true }).reasonCode, 'SUPER_ADMIN_OPERATIONAL_BYPASS');
});

test('KERNEL-CERT-004 audit chain detects tampering', () => {
  const base = { actorId: 'u1', action: 'TEST_ACTION', resourceType: 'TEST', resourceId: '1', result: 'SUCCESS', requestId: 'req-1', correlationId: 'corr-1', policyVersion: 'AUTHZ-1.0', scope: 'RUDENIM-01', occurredAt: '2026-09-14T00:00:00.000Z' };
  const first = appendAuditEvent({ ...base, eventId: '1' });
  const second = appendAuditEvent({ ...base, eventId: '2', occurredAt: '2026-09-14T00:01:00.000Z' }, first.hash);
  assert.equal(verifyAuditChain([first, second]), true);
  assert.equal(verifyAuditChain([first, { ...second, action: 'TAMPERED' }]), false);
});
