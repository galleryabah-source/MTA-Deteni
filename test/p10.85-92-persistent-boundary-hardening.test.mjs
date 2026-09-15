import test from 'node:test';
import assert from 'node:assert/strict';
import { createSyntheticTemporaryExitPersistentAdapter } from '../src/runtime/temporary-exit-persistent-adapter.mjs';
import {
  assertMigrationFreezePolicy,
  assertProviderAfterCommit,
} from '../src/application/temporary-exit-persistence-readiness.mjs';

function commandInput(adapter, overrides = {}) {
  return {
    idempotencyKey: 'K-HARDEN-1',
    request: { operation: 'REQUEST', actorId: 'A-1', scope: 'S-1', payload: { state: 'EXIT_REQUESTED' } },
    resourceId: 'E-1',
    mutation: (current) => ({ ...(current ?? { state: 'READY' }), state: 'EXIT_REQUESTED' }),
    auditEvent: { eventId: 'AUD-HARDEN-1', actorId: 'A-1', scopeId: 'S-1' },
    outboxEvent: { eventId: 'OUT-HARDEN-1', type: 'DOCUMENT_READY' },
    ...overrides,
  };
}

test('P10.85 failure injection covers every critical transaction stage', () => {
  for (const stage of ['DOMAIN', 'AUDIT', 'OUTBOX', 'COMMIT']) {
    const adapter = createSyntheticTemporaryExitPersistentAdapter();
    adapter.create('E-1', { state: 'READY' });
    adapter.injectFailure(stage);
    assert.throws(() => adapter.executeCriticalCommand(commandInput(adapter)), new RegExp(`INJECTED_${stage}_FAILURE`));
    assert.deepEqual(adapter.getById('E-1'), { state: 'READY' });
    const snapshot = adapter.snapshot();
    assert.equal(snapshot.kernel.auditCount, 0);
    assert.equal(snapshot.kernel.outbox.length, 0);
    assert.equal(snapshot.kernel.idempotencyCount, 0);
  }
});

test('P10.86 failed critical command leaves no partial persistence and can be retried', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  adapter.create('E-1', { state: 'READY' });
  adapter.injectFailure('AUDIT');
  assert.throws(() => adapter.executeCriticalCommand(commandInput(adapter)), /INJECTED_AUDIT_FAILURE/);
  assert.equal(adapter.executeCriticalCommand(commandInput(adapter)).status, 'COMMITTED');
  assert.equal(adapter.getById('E-1').state, 'EXIT_REQUESTED');
});

test('P10.87 successful replay does not duplicate audit or outbox intent', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  adapter.create('E-1', { state: 'READY' });
  const input = commandInput(adapter);
  assert.equal(adapter.executeCriticalCommand(input).status, 'COMMITTED');
  assert.equal(adapter.executeCriticalCommand(input).status, 'REPLAY');
  const snapshot = adapter.snapshot();
  assert.equal(snapshot.kernel.auditCount, 1);
  assert.equal(snapshot.kernel.outbox.length, 1);
  assert.equal(snapshot.kernel.idempotencyCount, 1);
});

test('P10.88 duplicate outbox event is fail-closed and rolls back domain/audit', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  adapter.create('E-1', { state: 'READY' });
  assert.equal(adapter.executeCriticalCommand(commandInput(adapter)).status, 'COMMITTED');
  adapter.create('E-2', { state: 'READY' });
  assert.throws(() => adapter.executeCriticalCommand(commandInput(adapter, {
    idempotencyKey: 'K-HARDEN-2', resourceId: 'E-2',
    request: { operation: 'REQUEST', actorId: 'A-1', scope: 'S-1', payload: { state: 'EXIT_REQUESTED' } },
    auditEvent: { eventId: 'AUD-HARDEN-2', actorId: 'A-1', scopeId: 'S-1' },
  })), /OUTBOX_DUPLICATE_EVENT/);
  assert.deepEqual(adapter.getById('E-2'), { state: 'READY' });
  assert.equal(adapter.snapshot().kernel.auditCount, 1);
  assert.equal(adapter.snapshot().kernel.outbox.length, 1);
});

test('P10.89 provider boundary rejects pre-commit execution and allows post-commit only', () => {
  assert.throws(() => assertProviderAfterCommit({ transactionCommitted: false, provider: 'STORAGE' }), /PROVIDER_REQUIRES_COMMITTED_TRANSACTION/);
  assert.equal(assertProviderAfterCommit({ transactionCommitted: true, provider: 'STORAGE' }), true);
});

test('P10.90 migration freeze blocks schema change but not ordinary runtime commands', () => {
  assert.throws(() => assertMigrationFreezePolicy({ migrationFreeze: true, operation: 'SCHEMA_CHANGE' }), /MIGRATION_FREEZE_BLOCKS_SCHEMA_CHANGE/);
  assert.equal(assertMigrationFreezePolicy({ migrationFreeze: true, operation: 'RUNTIME_COMMAND' }), true);
});

test('P10.91 command boundary rejects missing mutation instead of partially writing', () => {
  const adapter = createSyntheticTemporaryExitPersistentAdapter();
  adapter.create('E-1', { state: 'READY' });
  assert.throws(() => adapter.executeCriticalCommand(commandInput(adapter, { mutation: undefined })), /MUTATION_REQUIRED/);
  assert.deepEqual(adapter.getById('E-1'), { state: 'READY' });
  assert.equal(adapter.snapshot().kernel.auditCount, 0);
  assert.equal(adapter.snapshot().kernel.outbox.length, 0);
});

test('P10.92 scope enforcement remains before the mutation boundary', () => {
  let mutated = false;
  const adapter = createSyntheticTemporaryExitPersistentAdapter({ scopeResolver: () => false });
  assert.throws(() => adapter.executeCriticalCommand(commandInput(adapter, {
    mutation: () => { mutated = true; return { state: 'SHOULD_NOT_COMMIT' }; },
  })), /SCOPE_DENIED/);
  assert.equal(mutated, false);
  assert.equal(adapter.snapshot().kernel.auditCount, 0);
  assert.equal(adapter.snapshot().kernel.outbox.length, 0);
});
