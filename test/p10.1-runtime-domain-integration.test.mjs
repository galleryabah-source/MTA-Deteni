import test from 'node:test';
import assert from 'node:assert/strict';
import { executeTemporaryExit } from '../src/application/temporary-exit-command.mjs';
import { assertTransition } from '../src/domain/deteni-lifecycle.mjs';
import { TransactionalKernelStore } from '../src/kernel/transactional-command.mjs';

const auth = {
  auth: { userId: 'synthetic-officer', sessionId: 'synthetic-session', active: true },
  permissions: ['deteni.exit.create'], allowedScopes: ['UNIT-A'],
  operationalAssignment: 'DETENTION-OFFICER', requiredAssignment: 'DETENTION-OFFICER',
  dutyActive: true, classificationAllowed: true, resourceExists: true,
  stateValid: true, policyAllowed: true, isSuperAdmin: false, superAdminOperationalBypass: false,
};

test('P10.1-RUNTIME-001: authorized temporary-exit command reaches transactional boundary', () => {
  const store = new TransactionalKernelStore();
  const result = executeTemporaryExit({ authContext: auth, detaineeId: 'synthetic-detainee-001', actorId: 'synthetic-officer', scope: 'UNIT-A', requestId: 'req-001', correlationId: 'corr-001', idempotencyKey: 'idem-001', store });
  assert.equal(result.status, 'COMMITTED');
  const snapshot = store.snapshot();
  assert.equal(snapshot.domain['synthetic-detainee-001'].state, 'EXIT_REQUESTED');
  assert.equal(snapshot.auditCount, 1); assert.equal(snapshot.outbox.length, 1); assert.equal(snapshot.idempotencyCount, 1);
});

test('P10.1-RUNTIME-002: authorization occurs before domain mutation', () => {
  const store = new TransactionalKernelStore();
  const result = executeTemporaryExit({ authContext: { ...auth, dutyActive: false }, detaineeId: 'synthetic-detainee-002', actorId: 'synthetic-officer', scope: 'UNIT-A', requestId: 'req-002', correlationId: 'corr-002', idempotencyKey: 'idem-002', store });
  assert.equal(result.status, 'DENIED'); assert.equal(result.reasonCode, 'DUTY_INACTIVE');
  assert.deepEqual(store.snapshot(), { domain: {}, auditCount: 0, outbox: [], idempotencyCount: 0 });
});

test('P10.1-RUNTIME-003: idempotent replay does not duplicate critical side effects', () => {
  const store = new TransactionalKernelStore();
  const input = { authContext: auth, detaineeId: 'synthetic-detainee-003', actorId: 'synthetic-officer', scope: 'UNIT-A', requestId: 'req-003', correlationId: 'corr-003', idempotencyKey: 'idem-003', store };
  assert.equal(executeTemporaryExit(input).status, 'COMMITTED');
  assert.equal(executeTemporaryExit(input).status, 'REPLAY');
  const snapshot = store.snapshot(); assert.equal(snapshot.auditCount, 1); assert.equal(snapshot.outbox.length, 1);
});

test('P10.1-DOMAIN-001: lifecycle transition contract rejects invalid jumps', () => {
  assert.deepEqual(assertTransition('ACTIVE', 'EXIT_REQUESTED'), { from: 'ACTIVE', to: 'EXIT_REQUESTED' });
  assert.throws(() => assertTransition('ACTIVE', 'DUTY_COMPLETED'), /INVALID_DOMAIN_TRANSITION/);
});
