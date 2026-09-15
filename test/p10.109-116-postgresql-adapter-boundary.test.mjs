import test from 'node:test';
import assert from 'node:assert/strict';
import { assertControlledPostgresAdapter, POSTGRES_ADAPTER_CONTRACT } from '../src/runtime/postgresql-adapter-spec.mjs';

test('P10.109 transaction contract requires transaction boundary', () => {
  assert.equal(POSTGRES_ADAPTER_CONTRACT.transaction.includes('COMMIT'), true);
  assert.doesNotThrow(() => assertControlledPostgresAdapter({ transaction: async () => {} }));
});

test('P10.110 migration freeze rejects schema-changing adapter surface', () => {
  assert.throws(() => assertControlledPostgresAdapter({ transaction: async () => {}, executeMigration: async () => {} }), /MIGRATION_FREEZE_BLOCKS_SCHEMA_CHANGE/);
});

test('P10.111 provider surface is forbidden inside persistence adapter', () => {
  assert.throws(() => assertControlledPostgresAdapter({ transaction: async () => {}, callProvider: async () => {} }, { migrationFreeze: false }), /PROVIDER_NOT_ALLOWED_IN_POSTGRES_TRANSACTION_ADAPTER/);
});

test('P10.112 grant consume is atomic and scoped', () => {
  assert.match(POSTGRES_ADAPTER_CONTRACT.artifactGrantConsume, /ACTIVE/);
  assert.match(POSTGRES_ADAPTER_CONTRACT.artifactGrantConsume, /actor/);
  assert.match(POSTGRES_ADAPTER_CONTRACT.artifactGrantConsume, /scope/);
  assert.match(POSTGRES_ADAPTER_CONTRACT.artifactGrantConsume, /object/);
});

test('P10.113 idempotency conflict is explicit', () => {
  assert.match(POSTGRES_ADAPTER_CONTRACT.idempotency, /different fingerprint fails/);
});

test('P10.114 audit is transactionally coupled', () => {
  assert.match(POSTGRES_ADAPTER_CONTRACT.audit, /transactionally coupled/);
});

test('P10.115 scope remains deny-by-default', () => {
  assert.match(POSTGRES_ADAPTER_CONTRACT.scope, /deny-by-default/);
});

test('P10.116 controlled path remains AI-off', () => {
  assert.equal(POSTGRES_ADAPTER_CONTRACT.ai, 'AI_ENABLED=false for controlled certification path');
});
