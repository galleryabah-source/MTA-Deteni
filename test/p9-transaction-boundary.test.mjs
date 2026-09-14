import test from 'node:test';
import assert from 'node:assert/strict';
import { TransactionalKernelStore } from '../src/kernel/transactional-command.mjs';

const request = { operation: 'DETENI_LEAVE_APPROVE', actorId: 'u-1', scope: 'office-1', resourceId: 'd-1', payload: { decision: 'APPROVED' } };
const auditEvent = { eventType: 'DETENI_LEAVE_APPROVED', actorId: 'u-1', resourceId: 'd-1', correlationId: 'corr-1' };
const outboxEvent = { eventId: 'evt-1', eventType: 'DETENI_LEAVE_APPROVED', aggregateType: 'DETENI_LEAVE', aggregateId: 'd-1', correlationId: 'corr-1', payloadVersion: '1.0', payload: { decision: 'APPROVED' } };

function command(store) {
  return store.command({
    idempotencyKey: 'idem-1',
    request,
    domainMutation: ({ set }) => set('d-1', { status: 'APPROVED' }),
    auditEvent,
    outboxEvent,
  });
}

test('OUTBOX-001 atomic command commits domain + audit + outbox', () => {
  const store = new TransactionalKernelStore();
  assert.deepEqual(command(store), { status: 'COMMITTED', eventId: 'evt-1' });
  const state = store.snapshot();
  assert.equal(state.domain['d-1'].status, 'APPROVED');
  assert.equal(state.auditCount, 1);
  assert.equal(state.outbox[0].status, 'PENDING');
});

test('OUTBOX-002 outbox failure rolls back domain and audit', () => {
  const store = new TransactionalKernelStore();
  store.injectFailure('OUTBOX');
  assert.throws(() => command(store), /INJECTED_OUTBOX_FAILURE/);
  assert.deepEqual(store.snapshot(), { domain: {}, auditCount: 0, outbox: [], idempotencyCount: 0 });
});

test('OUTBOX-002 audit failure rolls back domain and leaves no outbox', () => {
  const store = new TransactionalKernelStore();
  store.injectFailure('AUDIT');
  assert.throws(() => command(store), /INJECTED_AUDIT_FAILURE/);
  assert.deepEqual(store.snapshot(), { domain: {}, auditCount: 0, outbox: [], idempotencyCount: 0 });
});

test('OUTBOX-010 identical retry replays without duplicate business effects', () => {
  const store = new TransactionalKernelStore();
  assert.equal(command(store).status, 'COMMITTED');
  assert.deepEqual(command(store), { status: 'REPLAY' });
  const state = store.snapshot();
  assert.equal(state.auditCount, 1);
  assert.equal(state.outbox.length, 1);
  assert.equal(state.idempotencyCount, 1);
});

test('OUTBOX-010 idempotency key reuse with changed request is rejected', () => {
  const store = new TransactionalKernelStore();
  assert.equal(command(store).status, 'COMMITTED');
  const changed = store.command({
    idempotencyKey: 'idem-1',
    request: { ...request, payload: { decision: 'REJECTED' } },
    domainMutation: ({ set }) => set('d-1', { status: 'REJECTED' }),
    auditEvent,
    outboxEvent: { ...outboxEvent, eventId: 'evt-2' },
  });
  assert.deepEqual(changed, { status: 'CONFLICT', reasonCode: 'IDEMPOTENCY_KEY_REUSE' });
  assert.equal(store.snapshot().domain['d-1'].status, 'APPROVED');
});

test('OUTBOX-018 failure never creates an external-provider call inside transaction', () => {
  const store = new TransactionalKernelStore();
  let providerCalls = 0;
  store.injectFailure('OUTBOX');
  assert.throws(() => store.command({
    idempotencyKey: 'idem-provider',
    request,
    domainMutation: ({ set }) => set('d-1', { status: 'APPROVED' }),
    auditEvent,
    outboxEvent,
  }), /INJECTED_OUTBOX_FAILURE/);
  assert.equal(providerCalls, 0);
  assert.equal(store.snapshot().outbox.length, 0);
});

test('OUTBOX-019 sensitive payload is not copied into audit automatically', () => {
  const store = new TransactionalKernelStore();
  const sensitive = { ...outboxEvent, payload: { decision: 'APPROVED', secret: 'MUST_NOT_BE_IN_AUDIT' } };
  command(store);
  const result = store.snapshot();
  assert.equal(JSON.stringify(result).includes('MUST_NOT_BE_IN_AUDIT'), false);
  assert.equal(JSON.stringify(sensitive).includes('MUST_NOT_BE_IN_AUDIT'), true);
});
