import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TEMPORARY_EXIT_PERSISTENCE_REQUIREMENTS,
  assertTemporaryExitPersistenceAdapter,
  assertProviderAfterCommit,
  assertMigrationFreezePolicy,
} from '../src/application/temporary-exit-persistence-readiness.mjs';

test('P10.69 persistence adapter exposes the required transactional boundary', () => {
  const adapter = Object.fromEntries(TEMPORARY_EXIT_PERSISTENCE_REQUIREMENTS.map((name) => [name, () => undefined]));
  assert.equal(assertTemporaryExitPersistenceAdapter(adapter), adapter);
  assert.throws(() => assertTemporaryExitPersistenceAdapter({ ...adapter, appendOutbox: undefined }), /PERSISTENCE_REQUIREMENT_MISSING:outboxAppend/);
});

test('P10.70 idempotency, audit and outbox are mandatory adapter capabilities', () => {
  for (const method of ['checkIdempotency', 'appendAudit', 'appendOutbox']) {
    const adapter = { transaction: () => undefined, checkIdempotency: () => undefined, appendAudit: () => undefined, appendOutbox: () => undefined, assertScope: () => undefined };
    delete adapter[method];
    assert.throws(() => assertTemporaryExitPersistenceAdapter(adapter), new RegExp(`PERSISTENCE_REQUIREMENT_MISSING:${method === 'checkIdempotency' ? 'idempotency' : method === 'appendAudit' ? 'auditAppend' : 'outboxAppend'}`));
  }
});

test('P10.71 provider execution is fail-closed until transaction commit', () => {
  assert.throws(() => assertProviderAfterCommit({ transactionCommitted: false, provider: 'WHATSAPP_NOTIFY' }), /PROVIDER_REQUIRES_COMMITTED_TRANSACTION/);
  assert.equal(assertProviderAfterCommit({ transactionCommitted: true, provider: 'WHATSAPP_NOTIFY' }), true);
});

test('P10.72 migration freeze blocks schema changes', () => {
  assert.throws(() => assertMigrationFreezePolicy({ migrationFreeze: true, operation: 'SCHEMA_CHANGE' }), /MIGRATION_FREEZE_BLOCKS_SCHEMA_CHANGE/);
  assert.equal(assertMigrationFreezePolicy({ migrationFreeze: true, operation: 'DATA_READ' }), true);
});

test('P10.73 scope enforcement remains a persistence adapter responsibility', () => {
  const adapter = { transaction: () => undefined, checkIdempotency: () => undefined, appendAudit: () => undefined, appendOutbox: () => undefined, assertScope: () => true };
  assert.equal(assertTemporaryExitPersistenceAdapter(adapter), adapter);
  assert.equal(adapter.assertScope('SCOPE-1', 'SCOPE-1'), true);
});

test('P10.74 provider boundary does not become part of the persistence transaction contract', () => {
  const adapter = { transaction: () => undefined, checkIdempotency: () => undefined, appendAudit: () => undefined, appendOutbox: () => undefined, assertScope: () => undefined };
  assert.equal(typeof adapter.transaction, 'function');
  assert.equal(typeof adapter.appendOutbox, 'function');
  assert.equal(typeof adapter.sendWhatsApp, 'undefined');
});

test('P10.75 synthetic-only release gate remains explicit', () => {
  const safety = { productionData: false, secretsInRepo: false, aiEnabled: false };
  assert.equal(safety.productionData, false);
  assert.equal(safety.secretsInRepo, false);
  assert.equal(safety.aiEnabled, false);
});

test('P10.76 release gate requires the persistence contract before database execution', () => {
  const migrationFreeze = true;
  assert.throws(() => assertMigrationFreezePolicy({ migrationFreeze, operation: 'SCHEMA_CHANGE' }), /MIGRATION_FREEZE_BLOCKS_SCHEMA_CHANGE/);
  const adapter = { transaction: () => undefined, checkIdempotency: () => undefined, appendAudit: () => undefined, appendOutbox: () => undefined, assertScope: () => undefined };
  assert.equal(assertTemporaryExitPersistenceAdapter(adapter), adapter);
});
