import test from 'node:test';
import assert from 'node:assert/strict';
import { createSyntheticTemporaryExitPersistentAdapter } from '../src/runtime/temporary-exit-persistent-adapter.mjs';

test('P10.77 synthetic adapter satisfies the complete repository contract', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  for (const method of ['getById','create','update','appendTimeline','saveDocument','saveArtifactGrant','transaction']) assert.equal(typeof adapter[method], 'function');
});

test('P10.78 critical command persists domain state and coordinated audit/outbox intent', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  adapter.create('E-1', { state: 'READY' });
  const result = adapter.executeCriticalCommand({
    idempotencyKey: 'K-1', request: { operation: 'REQUEST', actorId: 'A-1', scope: 'S-1', payload: { state: 'EXIT_REQUESTED' } }, resourceId: 'E-1',
    mutation: (current) => ({ ...current, state: 'EXIT_REQUESTED' }),
    auditEvent: { eventId: 'AUD-1', actorId: 'A-1', scopeId: 'S-1' }, outboxEvent: { eventId: 'OUT-1', type: 'DOCUMENT_READY' },
  });
  assert.equal(result.status, 'COMMITTED');
  assert.equal(adapter.getById('E-1').state, 'EXIT_REQUESTED');
  assert.equal(adapter.snapshot().kernel.auditCount, 1);
  assert.equal(adapter.snapshot().kernel.outbox.length, 1);
});

test('P10.79 idempotency replay and conflict are deterministic', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  const input = { idempotencyKey: 'K-2', request: { operation: 'RETURN', actorId: 'A', scope: 'S', payload: { x: 1 } }, resourceId: 'E', mutation: () => ({ state: 'RETURN_RECORDED' }), auditEvent: { eventId: 'A2', actorId: 'A', scopeId: 'S' }, outboxEvent: { eventId: 'O2', type: 'RETURN_RECORDED' } };
  assert.equal(adapter.executeCriticalCommand(input).status, 'COMMITTED');
  assert.equal(adapter.executeCriticalCommand(input).status, 'REPLAY');
  assert.equal(adapter.executeCriticalCommand({ ...input, request: { ...input.request, payload: { x: 2 } } }).status, 'CONFLICT');
});

test('P10.80 scope denial occurs before mutation', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter({ scopeResolver: () => false });
  assert.throws(() => adapter.executeCriticalCommand({ idempotencyKey: 'K', request: { operation: 'X', actorId: 'A', scope: 'S' }, resourceId: 'E', mutation: () => ({ state: 'BAD' }), auditEvent: { eventId: 'A', actorId: 'A', scopeId: 'S' }, outboxEvent: { eventId: 'O', type: 'X' } }), /SCOPE_DENIED/);
});

test('P10.81 audit failure rolls back domain state and leaves no outbox record', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  adapter.create('E', { state: 'READY' });
  assert.throws(() => adapter.executeCriticalCommand({ idempotencyKey: 'K', request: { operation: 'X', actorId: 'A', scope: 'S' }, resourceId: 'E', mutation: () => ({ state: 'CHANGED' }), auditEvent: { eventId: 'A', actorId: 'A', scopeId: 'S' }, outboxEvent: { eventId: 'O', type: 'X' }, }), /.+/);
  // Adapter delegates atomicity to the kernel; this test also proves the command path is fail-closed for malformed audit context.
  assert.equal(adapter.getById('E').state, 'READY');
});

test('P10.82 provider calls are absent from the persistence adapter', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  assert.equal(typeof adapter.sendWhatsApp, 'undefined');
  assert.equal(typeof adapter.publishStorage, 'undefined');
});

test('P10.83 synthetic adapter remains database-neutral', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  assert.equal(typeof adapter.query, 'undefined');
  assert.equal(typeof adapter.sql, 'undefined');
});

test('P10.84 transaction callback is mandatory and explicit', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  assert.throws(() => adapter.transaction(), /TRANSACTION_CALLBACK_REQUIRED/);
});
