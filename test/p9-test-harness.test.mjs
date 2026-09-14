import test from 'node:test';
import assert from 'node:assert/strict';
import { assertTestEnvironment, buildEvidenceBundle, recordTest } from '../src/kernel/test-harness.mjs';

test('HARNESS-001 production test environment is rejected', () => {
  assert.throws(() => assertTestEnvironment({ APP_ENV: 'production' }), /TEST_ENVIRONMENT_PRODUCTION_FORBIDDEN/);
});

test('HARNESS-002 ambiguous environment is rejected', () => {
  assert.throws(() => assertTestEnvironment({ APP_ENV: 'qa' }), /TEST_ENVIRONMENT_AMBIGUOUS/);
});

test('HARNESS-003 explicit test environment defaults to AI-OFF and migration freeze', () => {
  assert.deepEqual(assertTestEnvironment({ APP_ENV: 'test', AI_ENABLED: 'false' }), { environment: 'test', aiEnabled: false, migrationFreeze: true });
});

test('HARNESS-004 test registry accepts stable result states', () => {
  const registry = [];
  recordTest(registry, { testId: 'OBS-001', requirement: 'liveness', result: 'PASS', severity: 'P1', evidence: 'local' });
  recordTest(registry, { testId: 'OBS-002', requirement: 'readiness', result: 'BLOCKED', severity: 'P1' });
  assert.equal(registry.length, 2); assert.equal(registry[1].result, 'BLOCKED');
});

test('HARNESS-005 evidence bundle is deterministic and hashed', () => {
  const args = { runId: 'run-1', commitSha: 'abc123', environment: 'test', appVersion: '0.1.0', fixtureVersion: 'fixture-1', aiEnabled: false, migrationFreeze: true, results: [{ testId: 'OBS-001', result: 'PASS' }], correlationIds: ['corr-1'] };
  const a = buildEvidenceBundle(args); const b = buildEvidenceBundle(args);
  assert.equal(a.evidenceSha256, b.evidenceSha256); assert.equal(a.configurationMode, 'AI_OFF'); assert.equal(a.migrationFreeze, true);
});

test('HARNESS-006 invalid test result cannot be recorded as PASS', () => {
  assert.throws(() => recordTest([], { testId: 'OBS-003', result: 'SKIPPED' }), /TEST_RESULT_INVALID/);
});
