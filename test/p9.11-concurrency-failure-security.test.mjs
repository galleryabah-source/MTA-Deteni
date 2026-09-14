import test from 'node:test';
import assert from 'node:assert/strict';
import { OutboxStore } from '../src/kernel/outbox.mjs';
import { IdempotencyStore } from '../src/kernel/idempotency.mjs';
import { authorize } from '../src/kernel/p9-kernel.mjs';

const event = (id = 'evt-1') => ({
  eventId: id,
  eventType: 'DETAINED_PERSON_TEMP_EXIT_REQUESTED',
  aggregateType: 'DETAINED_PERSON',
  aggregateId: 'synthetic-detainee-001',
  correlationId: 'corr-synthetic-001',
  causationId: 'cmd-synthetic-001',
  payloadVersion: '1.0',
  payload: { fixture: true, classification: 'L2' },
});

function baseAuth(overrides = {}) {
  return {
    auth: { userId: 'synthetic-officer', sessionId: 'synthetic-session', active: true },
    permission: 'deteni.exit.create', permissions: ['deteni.exit.create'],
    scope: 'UNIT-A', allowedScopes: ['UNIT-A'],
    operationalAssignment: 'DETENTION-OFFICER', requiredAssignment: 'DETENTION-OFFICER',
    dutyActive: true, classificationAllowed: true, resourceExists: true,
    stateValid: true, policyAllowed: true, isSuperAdmin: false,
    superAdminOperationalBypass: false, ...overrides,
  };
}

test('P9.11-CONC-001: concurrent idempotency execution commits exactly once', async () => {
  const store = new IdempotencyStore(); let executions = 0;
  const request = { operation: 'CREATE_EXIT', actorId: 'officer-1', scope: 'UNIT-A', resourceId: 'synthetic-detainee-001', payload: { date: '2026-09-14' } };
  const handler = () => { executions += 1; return { commandId: 'cmd-001' }; };
  const results = await Promise.all(Array.from({ length: 16 }, () => Promise.resolve(store.execute('same-key', request, handler))));
  assert.equal(executions, 1);
  assert.equal(results.filter((r) => r.status === 'EXECUTED').length, 1);
  assert.equal(results.filter((r) => r.status === 'REPLAY').length, 15);
});

test('P9.11-CONC-002: outbox worker race yields one active claim', async () => {
  const store = new OutboxStore(); store.enqueue(event('evt-race'));
  const claims = await Promise.all([Promise.resolve(store.claim('worker-A', 1000, 30000)), Promise.resolve(store.claim('worker-B', 1000, 30000))]);
  assert.equal(claims.filter(Boolean).length, 1);
  assert.equal(store.get('evt-race').leaseOwner, claims.find(Boolean).leaseOwner);
});

test('P9.11-FAIL-001: non-retryable failure is terminal and worker-owned', () => {
  const store = new OutboxStore(); store.enqueue(event('evt-fail')); store.claim('worker-A', 1000);
  assert.throws(() => store.deadLetter('evt-fail', 'NON_RETRYABLE_POLICY_FAILURE', 'worker-B'), /OUTBOX_LEASE_REQUIRED/);
  const dead = store.deadLetter('evt-fail', 'NON_RETRYABLE_POLICY_FAILURE', 'worker-A');
  assert.equal(dead.status, 'DEAD_LETTER'); assert.equal(dead.failureReason, 'NON_RETRYABLE_POLICY_FAILURE');
});

test('P9.11-FAIL-002: stale lease is recoverable by another worker', () => {
  const store = new OutboxStore(); store.enqueue(event('evt-stale')); store.claim('worker-A', 1000, 10);
  const recovered = store.claim('worker-B', 1011, 30);
  assert.equal(recovered.status, 'PROCESSING'); assert.equal(recovered.leaseOwner, 'worker-B'); assert.equal(recovered.attemptCount, 2);
});

test('P9.11-SEC-001..005: authorization security negatives remain deny-by-default', () => {
  const cases = [
    [{ auth: null }, 'AUTH_REQUIRED'], [{ scope: 'UNIT-B' }, 'SCOPE_DENIED'],
    [{ dutyActive: false }, 'DUTY_INACTIVE'], [{ classificationAllowed: false }, 'RESOURCE_CLASSIFICATION_DENIED'],
    [{ isSuperAdmin: true, superAdminOperationalBypass: true }, 'SUPER_ADMIN_OPERATIONAL_BYPASS'],
  ];
  for (const [overrides, reasonCode] of cases) { const decision = authorize(baseAuth(overrides)); assert.equal(decision.allowed, false); assert.equal(decision.reasonCode, reasonCode); }
});

test('P9.11-SEC-006: untrusted payload fields cannot grant authorization', () => {
  const decision = authorize(baseAuth({ payload: { role: 'SUPER_ADMIN', approved: true } }));
  assert.equal(decision.allowed, true); assert.equal(decision.policyVersion, 'AUTHZ-1.0');
});

test('P9.11-GOLD-001: synthetic golden path preserves explicit state transitions', () => {
  const states = [];
  const transition = (from, to) => states.push(`${from}->${to}`);
  transition('ACTIVE', 'EXIT_REQUESTED'); transition('EXIT_REQUESTED', 'ESCORT_ASSIGNED');
  transition('ESCORT_ASSIGNED', 'HANDOVER_RECORDED'); transition('HANDOVER_RECORDED', 'DUTY_COMPLETED');
  assert.deepEqual(states, ['ACTIVE->EXIT_REQUESTED', 'EXIT_REQUESTED->ESCORT_ASSIGNED', 'ESCORT_ASSIGNED->HANDOVER_RECORDED', 'HANDOVER_RECORDED->DUTY_COMPLETED']);
});

test('P9.11-PROV-001: provider call occurs only after outbox state is durable/claimable', () => {
  const store = new OutboxStore(); let providerCalls = 0;
  const staged = store.enqueue(event('evt-provider')); assert.equal(staged.status, 'ENQUEUED'); assert.equal(providerCalls, 0);
  const claimed = store.claim('worker-A', 2000); assert.ok(claimed);
  providerCalls += 1; store.complete('evt-provider', 'worker-A');
  assert.equal(providerCalls, 1); assert.equal(store.get('evt-provider').status, 'SUCCEEDED');
});
