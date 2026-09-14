import test from 'node:test';
import assert from 'node:assert/strict';
import { IdempotencyStore } from '../src/kernel/idempotency.mjs';
import { OutboxStore } from '../src/kernel/outbox.mjs';

test('same idempotency key replays without executing twice', () => {
  const store = new IdempotencyStore();
  let calls = 0;
  const request = { operation: 'leave.complete', actorId: 'synthetic-actor', scope: 'synthetic', resourceId: 'd-001', payload: { state: 'COMPLETED' } };
  const first = store.execute('key-001', request, () => { calls += 1; return { ok: true, version: 1 }; });
  const second = store.execute('key-001', request, () => { calls += 1; return { ok: true, version: 2 }; });
  assert.equal(first.status, 'EXECUTED');
  assert.equal(second.status, 'REPLAY');
  assert.deepEqual(second.result, first.result);
  assert.equal(calls, 1);
});

test('same idempotency key with different fingerprint conflicts', () => {
  const store = new IdempotencyStore();
  const base = { operation: 'leave.complete', actorId: 'a', scope: 's', resourceId: 'd-001', payload: { state: 'COMPLETED' } };
  store.execute('key-002', base, () => 'authoritative');
  const conflict = store.execute('key-002', { ...base, payload: { state: 'CANCELLED' } }, () => 'must-not-run');
  assert.equal(conflict.status, 'CONFLICT');
});

test('outbox claim is lease-based and stale claims recover', () => {
  const outbox = new OutboxStore();
  outbox.enqueue({ eventId: 'evt-001', type: 'LEAVE_COMPLETED', aggregateId: 'd-001', payload: { synthetic: true } });
  const first = outbox.claim('worker-a', 1000, 100);
  assert.equal(first.status, 'PROCESSING');
  assert.equal(outbox.claim('worker-b', 1050, 100), null);
  const recovered = outbox.claim('worker-b', 1101, 100);
  assert.equal(recovered.workerId, 'worker-b');
  assert.equal(recovered.attempts, 2);
});

test('outbox duplicate event ids do not create a second authoritative event', () => {
  const outbox = new OutboxStore();
  const a = outbox.enqueue({ eventId: 'evt-002', type: 'AUDIT', aggregateId: 'x', payload: {} });
  const b = outbox.enqueue({ eventId: 'evt-002', type: 'AUDIT', aggregateId: 'x', payload: { changed: true } });
  assert.equal(a.status, 'ENQUEUED');
  assert.equal(b.status, 'DUPLICATE');
  assert.deepEqual(b.event.payload, {});
});

test('outbox supports deterministic retry and dead-letter', () => {
  const outbox = new OutboxStore();
  outbox.enqueue({ eventId: 'evt-003', type: 'DELIVERY', aggregateId: 'x', payload: {} });
  outbox.claim('worker', 1000, 100);
  const retry = outbox.retry('evt-003', 2000);
  assert.equal(retry.status, 'PENDING');
  assert.equal(retry.availableAt, 2000);
  const dlq = outbox.deadLetter('evt-003', 'synthetic-provider-failure');
  assert.equal(dlq.status, 'DEAD_LETTER');
});
