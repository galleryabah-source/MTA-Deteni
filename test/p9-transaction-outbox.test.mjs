import test from 'node:test';
import assert from 'node:assert/strict';
import { IdempotencyStore, fingerprint } from '../src/kernel/idempotency.mjs';
import { OutboxStore } from '../src/kernel/outbox.mjs';

const event = (id, payload = {}) => ({ eventId: id, eventType: 'LEAVE_COMPLETED', aggregateType: 'DETAINEE_LEAVE', aggregateId: 'd-001', correlationId: 'corr-001', payloadVersion: '1.0', payload });

test('same idempotency key replays without executing twice', () => {
  const store = new IdempotencyStore(); let calls = 0;
  const request = { operation: 'leave.complete', actorId: 'synthetic-actor', scope: 'synthetic', resourceId: 'd-001', payload: { state: 'COMPLETED' } };
  const first = store.execute('key-001', request, () => { calls += 1; return { ok: true, version: 1 }; });
  const second = store.execute('key-001', request, () => { calls += 1; return { ok: true, version: 2 }; });
  assert.equal(first.status, 'EXECUTED'); assert.equal(second.status, 'REPLAY'); assert.deepEqual(second.result, first.result); assert.equal(calls, 1);
});

test('same idempotency key with different fingerprint conflicts', () => {
  const store = new IdempotencyStore();
  const base = { operation: 'leave.complete', actorId: 'a', scope: 's', resourceId: 'd-001', payload: { state: 'COMPLETED' } };
  store.execute('key-002', base, () => 'authoritative');
  assert.equal(store.execute('key-002', { ...base, payload: { state: 'CANCELLED' } }, () => 'must-not-run').status, 'CONFLICT');
});

test('idempotency fingerprint is invariant to object property order', () => {
  const a = { operation: 'leave.complete', actorId: 'a', scope: 's', resourceId: 'd-001', payload: { state: 'COMPLETED', meta: { z: 1, a: 2 } } };
  const b = { payload: { meta: { a: 2, z: 1 }, state: 'COMPLETED' }, resourceId: 'd-001', scope: 's', actorId: 'a', operation: 'leave.complete' };
  assert.equal(fingerprint(a), fingerprint(b));
});

test('outbox claim is lease-based and stale claims recover', () => {
  const outbox = new OutboxStore(); outbox.enqueue(event('evt-001'));
  const first = outbox.claim('worker-a', 1000, 100); assert.equal(first.status, 'PROCESSING');
  assert.equal(outbox.claim('worker-b', 1050, 100), null);
  const recovered = outbox.claim('worker-b', 1101, 100); assert.equal(recovered.leaseOwner, 'worker-b'); assert.equal(recovered.attemptCount, 2);
});

test('outbox duplicate event ids do not create a second authoritative event', () => {
  const outbox = new OutboxStore(); const a = outbox.enqueue(event('evt-002')); const b = outbox.enqueue(event('evt-002', { changed: true }));
  assert.equal(a.status, 'ENQUEUED'); assert.equal(b.status, 'DUPLICATE'); assert.deepEqual(b.event.payload, {});
});

test('outbox supports retry, success and dead-letter lifecycle', () => {
  const outbox = new OutboxStore(); outbox.enqueue(event('evt-003'));
  outbox.claim('worker', 1000, 100);
  const retry = outbox.retry('evt-003', 2000, 'worker'); assert.equal(retry.status, 'RETRY'); assert.equal(retry.availableAt, 2000);
  outbox.claim('worker', 2000, 100); const success = outbox.complete('evt-003', 'worker'); assert.equal(success.status, 'SUCCEEDED');
  outbox.enqueue(event('evt-004')); outbox.claim('worker', 1000, 100); const dlq = outbox.deadLetter('evt-004', 'synthetic-provider-failure', 'worker'); assert.equal(dlq.status, 'DEAD_LETTER');
});

test('outbox rejects incomplete event contracts', () => {
  const outbox = new OutboxStore();
  assert.throws(() => outbox.enqueue({ eventId: 'evt-invalid' }), /OUTBOX_EVENT_CONTRACT_INVALID/);
  assert.equal(OutboxStore.isValidState('RETRY'), true); assert.equal(OutboxStore.isValidState('DELIVERED'), false);
});
