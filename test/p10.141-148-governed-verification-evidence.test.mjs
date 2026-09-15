import test from 'node:test';
import assert from 'node:assert/strict';
import { assertLiveVerificationBlocked, assertVerificationSafety, classifyScenarioResults, createVerificationEvidence, VERIFICATION_SCENARIOS } from '../src/runtime/governed-verification-evidence.mjs';

test('P10.141: evidence schema requires immutable run and commit identity', () => {
  const evidence = createVerificationEvidence({ runId: 'RUN-SYN-001', commitSha: 'abc123', safety: { appEnv: 'test', aiEnabled: 'false', migrationFreeze: 'true' } });
  assert.equal(evidence.schemaVersion, 'p10.141.v1');
  assert.equal(evidence.syntheticOnly, true);
  assert.equal(evidence.runId, 'RUN-SYN-001');
  assert.equal(evidence.commitSha, 'abc123');
});

test('P10.142: safety boundary is fail-closed', () => {
  assert.doesNotThrow(() => assertVerificationSafety({ appEnv: 'test', aiEnabled: 'false', migrationFreeze: 'true', syntheticOnly: true }));
  assert.throws(() => assertVerificationSafety({ appEnv: 'production', aiEnabled: 'false', migrationFreeze: 'true' }), /UNSAFE_APP_ENV/);
  assert.throws(() => assertVerificationSafety({ appEnv: 'test', aiEnabled: 'true', migrationFreeze: 'true' }), /AI_NOT_DISABLED/);
  assert.throws(() => assertVerificationSafety({ appEnv: 'test', aiEnabled: 'false', migrationFreeze: 'false' }), /MIGRATION_FREEZE_NOT_ACTIVE/);
});

test('P10.143: scenario matrix is explicit and bounded', () => {
  const evidence = createVerificationEvidence({ runId: 'RUN-SYN-002', commitSha: 'def456', safety: { appEnv: 'test', aiEnabled: 'false', migrationFreeze: 'true' } });
  assert.deepEqual(evidence.scenarios, VERIFICATION_SCENARIOS);
  assert.throws(() => createVerificationEvidence({ runId: 'RUN-SYN-003', commitSha: 'ghi789', safety: { appEnv: 'test', aiEnabled: 'false', migrationFreeze: 'true' }, scenarios: ['unknown'] }), /UNKNOWN_VERIFICATION_SCENARIO/);
});

test('P10.144: evidence classification is deterministic', () => {
  assert.equal(classifyScenarioResults([]), 'BLOCKED');
  assert.equal(classifyScenarioResults([{ classification: 'PASS' }, { classification: 'PASS' }]), 'PASS');
  assert.equal(classifyScenarioResults([{ classification: 'PASS' }, { classification: 'BLOCKED' }]), 'BLOCKED');
  assert.equal(classifyScenarioResults([{ classification: 'FAIL' }, { classification: 'PASS' }]), 'FAIL');
});

test('P10.145: live verification remains blocked during freeze', () => {
  assert.throws(() => assertLiveVerificationBlocked({ migrationFreeze: 'true', allowLive: true }), /LIVE_VERIFICATION_BLOCKED/);
  assert.throws(() => assertLiveVerificationBlocked({ migrationFreeze: 'false', allowLive: false }), /LIVE_VERIFICATION_BLOCKED/);
});

test('P10.146: observations are copied and cannot mutate source evidence', () => {
  const observations = [{ scenario: 'expiry-enforcement', affectedRows: 0 }];
  const evidence = createVerificationEvidence({ runId: 'RUN-SYN-004', commitSha: 'jkl012', safety: { appEnv: 'test', aiEnabled: 'false', migrationFreeze: 'true' }, observations });
  observations[0].affectedRows = 99;
  assert.equal(evidence.observations[0].affectedRows, 0);
});

test('P10.147: malformed identity and safety input fails closed', () => {
  assert.throws(() => createVerificationEvidence({ commitSha: 'abc', safety: { appEnv: 'test', aiEnabled: 'false', migrationFreeze: 'true' } }), /RUN_ID_REQUIRED/);
  assert.throws(() => createVerificationEvidence({ runId: 'run', commitSha: '', safety: { appEnv: 'test', aiEnabled: 'false', migrationFreeze: 'true' } }), /COMMIT_SHA_REQUIRED/);
  assert.throws(() => createVerificationEvidence({ runId: 'run', commitSha: 'abc', safety: { appEnv: 'test', aiEnabled: 'false', migrationFreeze: 'true' }, classification: 'UNKNOWN' }), /INVALID_CLASSIFICATION/);
});

test('P10.148: evidence remains readiness-only and contains no provider operation surface', () => {
  const evidence = createVerificationEvidence({ runId: 'RUN-SYN-005', commitSha: 'mno345', safety: { appEnv: 'test', aiEnabled: 'false', migrationFreeze: 'true' } });
  assert.equal(Object.hasOwn(evidence, 'provider'), false);
  assert.equal(Object.hasOwn(evidence, 'database'), false);
  assert.equal(Object.hasOwn(evidence, 'credentials'), false);
  assert.equal(Object.hasOwn(evidence, 'detaineeData'), false);
});
