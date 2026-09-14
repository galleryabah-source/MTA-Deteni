import test from 'node:test';
import assert from 'node:assert/strict';
import { executePlacement } from '../src/application/placement-command.mjs';
import { validatePlacementCommand } from '../src/domain/placement.mjs';
import { TransactionalKernelStore } from '../src/kernel/transactional-command.mjs';

const auth = {
  auth: { userId: 'synthetic-kamtib', sessionId: 'synthetic-session', active: true },
  permissions: ['deteni.placement.transfer'], allowedScopes: ['UNIT-A'],
  operationalAssignment: 'KAMTIB-OFFICER', requiredAssignment: 'KAMTIB-OFFICER',
  dutyActive: true, classificationAllowed: true, resourceExists: true,
  stateValid: true, policyAllowed: true, isSuperAdmin: false, superAdminOperationalBypass: false,
};

const input = (overrides = {}) => ({ authContext: auth, detaineeId: 'synthetic-detainee-101', detaineeState: 'ACTIVE', sourceRoomId: 'ROOM-01', targetBlockId: 'BLOCK-B', targetRoomId: 'ROOM-02', targetCapacityRemaining: 1, actorId: 'synthetic-kamtib', scope: 'UNIT-A', requestId: 'req-place-001', correlationId: 'corr-place-001', idempotencyKey: 'idem-place-001', store: new TransactionalKernelStore(), ...overrides });

test('P10.2-PLACEMENT-001: authorized placement reaches transaction boundary', () => {
  const args = input(); const result = executePlacement(args);
  assert.equal(result.status, 'COMMITTED');
  const snapshot = args.store.snapshot();
  assert.deepEqual(snapshot.domain['synthetic-detainee-101'], { detaineeId: 'synthetic-detainee-101', blockId: 'BLOCK-B', roomId: 'ROOM-02', status: 'ACTIVE', requestId: 'req-place-001' });
  assert.equal(snapshot.auditCount, 1); assert.equal(snapshot.outbox.length, 1); assert.equal(snapshot.idempotencyCount, 1);
});

test('P10.2-PLACEMENT-002: missing placement permission is denied before mutation', () => {
  const args = input({ authContext: { ...auth, permissions: [] } }); const result = executePlacement(args);
  assert.equal(result.status, 'DENIED'); assert.equal(result.reasonCode, 'PERMISSION_DENIED');
  assert.deepEqual(args.store.snapshot(), { domain: {}, auditCount: 0, outbox: [], idempotencyCount: 0 });
});

test('P10.2-PLACEMENT-003: non-active detainee cannot be placed', () => {
  const args = input({ detaineeState: 'EXIT_REQUESTED' });
  assert.throws(() => executePlacement(args), /PLACEMENT_STATE_NOT_ELIGIBLE/);
  assert.deepEqual(args.store.snapshot(), { domain: {}, auditCount: 0, outbox: [], idempotencyCount: 0 });
});

test('P10.2-PLACEMENT-004: exhausted target capacity is rejected', () => {
  const args = input({ targetCapacityRemaining: 0 });
  assert.throws(() => executePlacement(args), /PLACEMENT_CAPACITY_EXCEEDED/);
});

test('P10.2-PLACEMENT-005: placement idempotency replay has no duplicate side effects', () => {
  const store = new TransactionalKernelStore(); const args = input({ store });
  assert.equal(executePlacement(args).status, 'COMMITTED');
  assert.equal(executePlacement(args).status, 'REPLAY');
  const snapshot = store.snapshot(); assert.equal(snapshot.auditCount, 1); assert.equal(snapshot.outbox.length, 1);
});

test('P10.2-PLACEMENT-006: same idempotency key with different target conflicts', () => {
  const store = new TransactionalKernelStore(); const first = input({ store }); const second = input({ store, targetRoomId: 'ROOM-03' });
  assert.equal(executePlacement(first).status, 'COMMITTED');
  assert.equal(executePlacement(second).status, 'CONFLICT');
  assert.equal(store.snapshot().outbox.length, 1);
});

test('P10.2-PLACEMENT-007: placement command context is explicit', () => {
  assert.throws(() => validatePlacementCommand({ detaineeId: 'x' }), /PLACEMENT_CONTEXT_REQUIRED/);
});
