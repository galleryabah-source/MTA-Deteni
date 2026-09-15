import test from 'node:test';
import assert from 'node:assert/strict';
import { createHttpCommandGateway } from '../src/runtime/http-command-gateway.mjs';
import { composeAuthenticatedCommand } from '../src/application/authenticated-command-composer.mjs';
import { createUnifiedTemporaryExitService } from '../src/application/unified-temporary-exit-service.mjs';
import { createSyntheticTemporaryExitPersistentAdapter } from '../src/runtime/temporary-exit-persistent-adapter.mjs';

const principal = { actorId: 'ACTOR-1', scopeId: 'RUDENIM-1', dutyId: 'DUTY-1', classification: 'INTERNAL' };
const session = {
  active: true,
  userId: principal.actorId,
  scope: principal.scopeId,
  dutyId: principal.dutyId,
  classification: principal.classification,
  sessionId: 'SESSION-1',
  csrfToken: 'csrf-1',
  authz: { permission: { allowed: true }, scope: { allowed: true } },
};

function gatewayFor(handler) {
  return createHttpCommandGateway({
    resolveSession: async () => session,
    commandHandlers: { 'POST /temporary-exit': handler },
    now: () => '2026-09-15T00:00:00.000Z',
  });
}

test('P10.101 gateway composes server-authoritative identity', async () => {
  let received;
  const gateway = gatewayFor({ permission: 'temporary-exit:request', operation: 'TEMPORARY_EXIT_REQUEST', execute: async (command) => { received = command; return { ok: true }; } });
  const response = await gateway.handle({
    method: 'POST', path: '/temporary-exit', headers: { 'x-csrf-token': 'csrf-1', 'idempotency-key': 'idem-101' },
    body: { resourceId: 'EXIT-101', actorId: principal.actorId, scopeId: principal.scopeId, detaineeId: 'DET-SYN-1' },
  });
  assert.equal(response.status, 200);
  assert.equal(received.actorId, principal.actorId);
  assert.equal(received.scopeId, principal.scopeId);
  assert.equal(received.idempotencyKey, 'idem-101');
});

test('P10.102 gateway rejects client identity substitution', async () => {
  const gateway = gatewayFor({ permission: 'temporary-exit:request', execute: async () => ({ ok: true }) });
  const response = await gateway.handle({ method: 'POST', path: '/temporary-exit', headers: { 'x-csrf-token': 'csrf-1', 'idempotency-key': 'idem-102' }, body: { actorId: 'ATTACKER', scopeId: principal.scopeId } });
  assert.equal(response.status, 400);
  assert.equal(response.body.code, 'CLIENT_ACTOR_MISMATCH');
});

test('P10.103 gateway requires idempotency key for mutations', async () => {
  const gateway = gatewayFor({ permission: 'temporary-exit:request', execute: async () => ({ ok: true }) });
  const response = await gateway.handle({ method: 'POST', path: '/temporary-exit', headers: { 'x-csrf-token': 'csrf-1' }, body: {} });
  assert.equal(response.status, 400);
  assert.equal(response.body.code, 'IDEMPOTENCY_KEY_REQUIRED');
});

test('P10.104 unified service can execute against persistent-boundary adapter without providers', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter({ scopeResolver: (actorId, scopeId) => actorId === principal.actorId && scopeId === principal.scopeId });
  const service = createUnifiedTemporaryExitService({ repository: adapter });
  const requested = service.request({ exitId: 'EXIT-104', actorId: principal.actorId, scopeId: principal.scopeId, detaineeId: 'DET-SYN-104', idempotencyKey: 'idem-104' });
  assert.equal(requested.operationalState, 'EXIT_REQUESTED');
  assert.equal(service.read({ exitId: 'EXIT-104' }).operationalState, 'EXIT_REQUESTED');
});

test('P10.105 adapter denies wrong scope before mutation', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter({ scopeResolver: () => false });
  assert.throws(() => adapter.executeCriticalCommand({
    idempotencyKey: 'idem-105', request: { actorId: principal.actorId, scope: principal.scopeId, resourceId: 'EXIT-105' },
    mutation: () => ({ state: 'MUTATED' }), auditEvent: { eventId: 'AUD-105', actorId: principal.actorId, scopeId: principal.scopeId }, outboxEvent: { eventId: 'OUT-105', type: 'TEMPORARY_EXIT' },
  }), /SCOPE_DENIED/);
  assert.equal(adapter.getById('EXIT-105'), null);
});

test('P10.106 command composition preserves request and correlation context', () => {
  const command = composeAuthenticatedCommand({ principal, input: { operation: 'TEMPORARY_EXIT_REQUEST', resourceId: 'EXIT-106', idempotencyKey: ' idem-106 ', requestId: 'REQ-106', correlationId: 'CORR-106', payload: { x: 1 } } });
  assert.equal(command.idempotencyKey, 'idem-106');
  assert.equal(command.requestId, 'REQ-106');
  assert.equal(command.correlationId, 'CORR-106');
});

test('P10.107 provider boundary remains outside command transaction', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  assert.equal(typeof adapter.appendOutbox, 'function');
  assert.equal(adapter.snapshot().kernel.outbox.length, 0);
});

test('P10.108 synthetic boundary remains free of provider methods', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  assert.equal('sendWhatsapp' in adapter, false);
  assert.equal('publishExternal' in adapter, false);
  assert.equal('syncDevice' in adapter, false);
});
