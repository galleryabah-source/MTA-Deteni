import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPreCertificationConsistency, classifyPreCertificationConsistency } from '../src/runtime/pre-certification-consistency-gate.mjs';

function pkg(overrides = {}) {
  const regressionEvidence = { checkpoint: 'P10.164', commitSha: 'commit-164', classification: 'PASS', syntheticOnly: true, safety: { APP_ENV: 'test', AI_ENABLED: 'false', MIGRATION_FREEZE: 'true' }, requiredTestCount: 80, missingTests: [] };
  const integrityEvidence = { checkpoint: 'P10.164', commitSha: 'commit-164', classification: 'PASS', syntheticOnly: true, safety: { APP_ENV: 'test', AI_ENABLED: 'false', MIGRATION_FREEZE: 'true' }, requiredTestCount: 80 };
  const releaseManifest = { schemaVersion: 'MTA-EVIDENCE-V1', checkpoint: 'P10.164', commitSha: 'commit-164', safety: { migrationFreeze: true, aiEnabled: false }, tests: [{ name: 'gate-a', status: 'PASS' }], manifestSha256: 'synthetic-hash' };
  return { regressionEvidence, integrityEvidence, releaseManifest, expectedCheckpoint: 'P10.164', expectedCommitSha: 'commit-164', ...overrides };
}

test('P10.157: all evidence identities must agree', () => {
  const result = assertPreCertificationConsistency(pkg());
  assert.equal(result.classification, 'PASS');
  assert.equal(result.checkpoint, 'P10.164');
});

test('P10.158: checkpoint mismatch is fail-closed', () => {
  assert.throws(() => assertPreCertificationConsistency(pkg({ expectedCheckpoint: 'P10.165' })), /REGRESSION_CHECKPOINT_MISMATCH/);
});

test('P10.159: commit mismatch is fail-closed', () => {
  assert.throws(() => assertPreCertificationConsistency(pkg({ expectedCommitSha: 'other-commit' })), /REGRESSION_COMMIT_MISMATCH/);
});

test('P10.160: non-PASS evidence cannot reach certification consistency', () => {
  const input = pkg({ regressionEvidence: { ...pkg().regressionEvidence, classification: 'BLOCKED' } });
  assert.throws(() => assertPreCertificationConsistency(input), /REGRESSION_NOT_PASS/);
});

test('P10.161: test-count and missing-test consistency is mandatory', () => {
  assert.throws(() => assertPreCertificationConsistency(pkg({ integrityEvidence: { ...pkg().integrityEvidence, requiredTestCount: 79 } })), /INTEGRITY_TEST_COUNT_MISMATCH/);
  assert.throws(() => assertPreCertificationConsistency(pkg({ regressionEvidence: { ...pkg().regressionEvidence, missingTests: ['missing.mjs'] } })), /REGRESSION_MISSING_TESTS/);
});

test('P10.162: unsafe evidence is rejected', () => {
  assert.throws(() => assertPreCertificationConsistency(pkg({ integrityEvidence: { ...pkg().integrityEvidence, safety: { APP_ENV: 'production', AI_ENABLED: 'false', MIGRATION_FREEZE: 'true' } } })), /INTEGRITY_EVIDENCE_UNSAFE_APP_ENV/);
});

test('P10.163: release manifest safety and schema are independently enforced', () => {
  assert.throws(() => assertPreCertificationConsistency(pkg({ releaseManifest: { ...pkg().releaseManifest, schemaVersion: 'OLD' } })), /RELEASE_SCHEMA_UNSUPPORTED/);
  assert.throws(() => assertPreCertificationConsistency(pkg({ releaseManifest: { ...pkg().releaseManifest, safety: { migrationFreeze: false, aiEnabled: false } } })), /RELEASE_SAFETY_INVALID/);
});

test('P10.164: classifier converts any consistency failure to BLOCKED without fabricating PASS', () => {
  const result = classifyPreCertificationConsistency(pkg({ releaseManifest: { ...pkg().releaseManifest, checkpoint: 'P10.163' } }));
  assert.equal(result.classification, 'BLOCKED');
  assert.match(result.reason, /RELEASE_CHECKPOINT_MISMATCH/);
});
