import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const requiredSuites = [
  'tests/p9-kernel.test.mjs',
  'test/p9-transaction-outbox.test.mjs',
  'test/p9-transaction-boundary.test.mjs',
  'test/p9-private-storage.test.mjs',
  'test/p9-observability.test.mjs',
  'test/p9-test-harness.test.mjs',
  'test/p9.11-concurrency-failure-security.test.mjs',
];

test('P9.12-CI-001: certification environment is fail-closed', () => {
  assert.equal(process.env.APP_ENV, 'test');
  assert.equal(process.env.AI_ENABLED, 'false');
  assert.equal(process.env.MIGRATION_FREEZE, 'true');
});

test('P9.12-CI-002: every registered executable suite exists in the checkout', () => {
  for (const suite of requiredSuites) assert.equal(existsSync(suite), true, suite);
});

test('P9.12-CI-003: production environment cannot be selected by this gate', () => {
  assert.notEqual(process.env.APP_ENV, 'production');
});
