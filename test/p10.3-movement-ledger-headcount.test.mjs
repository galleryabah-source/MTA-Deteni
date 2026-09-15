import test from 'node:test';
import assert from 'node:assert/strict';
import { appendMovementEvent, projectHeadcount } from '../src/domain/movement-ledger.mjs';
import { executeMovement } from '../src/application/movement-command.mjs';
import { TransactionalKernelStore } from '../src/kernel/transactional-command.mjs';

const auth = {
  auth: { userId: 'synthetic-officer', sessionId: 'synthetic-session', active: true },
  permissions: ['deteni.placement.transfer'], allowedScopes: ['UNIT-A'],
  operationalAssignment: 'DETENTION-OFFICER', requiredAssignment: 'DETENTION-OFFICER',
  dutyActive: true, classificationAllowed: true, resourceExists: true,
  stateValid: true, policyAllowed: true, isSuperAdmin: false, superAdminOperationalBypass: false,
};

const movement = { detaineeId: 'd-001', detaineeState: 'ACTIVE', fromBlockId: 'B1', fromRoomId: 'R1', toBlockId: 'B2', toRoomId: 'R2', actorId: 'officer', scope: 'UNIT-A', requestId: 'req-1', correlationId: 'corr-1' };

test('P10.3-MOVEMENT-001: ledger append is immutable and sequenced', () => {
  const first = appendMovementEvent([], movement);
  assert.equal(first.status, 'APPENDED'); assert.equal(first.event.sequence, 1); assert.equal(first.event.immutable, true);
  const replay = appendMovementEvent(first.ledger, movement);
  assert.equal(replay.status, 'REPLAY'); assert.equal(replay.ledger.length, 1);
});

test('P10.3-MOVEMENT-002: different requests append history rather than overwrite', () => {
  const a = appendMovementEvent([], movement);
  const b = appendMovementEvent(a.ledger, { ...movement, requestId: 'req-2', correlationId: 'corr-2', toBlockId: 'B3', toRoomId: 'R3' });
  assert.equal(b.ledger.length, 2); assert.deepEqual(b.ledger.map((x) => x.sequence), [1, 2]); assert.equal(b.ledger[0].toRoomId, 'R2');
});

test('P10.3-MOVEMENT-003: invalid state is rejected before append', () => {
  assert.throws(() => appendMovementEvent([], { ...movement, detaineeState: 'DUTY_COMPLETED' }), /MOVEMENT_STATE_NOT_ELIGIBLE/);
});

test('P10.3-MOVEMENT-004: headcount projection derives current placement from ledger', () => {
  const a = appendMovementEvent([], movement);
  const b = appendMovementEvent(a.ledger, { ...movement, requestId: 'req-2', correlationId: 'corr-2', detaineeId: 'd-002', toBlockId: 'B2', toRoomId: 'R2' });
  const c = appendMovementEvent(b.ledger, { ...movement, requestId: 'req-3', correlationId: 'corr-3', detaineeId: 'd-001', fromRoomId: 'R2', toBlockId: 'B3', toRoomId: 'R3' });
  const projection = projectHeadcount(c.ledger);
  assert.equal(projection.total, 2); assert.equal(projection.byRoom.R2, 1); assert.equal(projection.byRoom.R3, 1); assert.equal(projection.placements['d-001'].roomId, 'R3');
});

test('P10.3-MOVEMENT-005: unauthorized movement has no transactional side effects', () => {
  const store = new TransactionalKernelStore();
  const result = executeMovement({ authContext: { ...auth, dutyActive: false }, ...movement, idempotencyKey: 'idem-1', store });
  assert.equal(result.status, 'DENIED'); assert.equal(result.reasonCode, 'DUTY_INACTIVE'); assert.deepEqual(store.snapshot(), { domain: {}, auditCount: 0, outbox: [], idempotencyCount: 0 });
});

test('P10.3-MOVEMENT-006: authorized movement commits audit and outbox atomically', () => {
  const store = new TransactionalKernelStore();
  const result = executeMovement({ authContext: auth, ...movement, idempotencyKey: 'idem-2', store });
  assert.equal(result.status, 'COMMITTED'); const snapshot = store.snapshot();
  assert.equal(snapshot.domain['d-001'].roomId, 'R2'); assert.equal(snapshot.auditCount, 1); assert.equal(snapshot.outbox.length, 1); assert.equal(snapshot.idempotencyCount, 1);
});

test('P10.3-MOVEMENT-007: explicit context is mandatory', () => {
  assert.throws(() => appendMovementEvent([], { ...movement, correlationId: '' }), /MOVEMENT_CONTEXT_REQUIRED/);
});
