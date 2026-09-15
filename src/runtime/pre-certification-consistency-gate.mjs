const REQUIRED_SCHEMA = 'MTA-EVIDENCE-V1';

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name}_REQUIRED`);
  return value.trim();
}

function assertSafeEvidence(evidence, name) {
  if (!evidence || evidence.syntheticOnly !== true) throw new Error(`${name}_NOT_SYNTHETIC`);
  const safety = evidence.safety ?? {};
  if (safety.APP_ENV !== undefined && safety.APP_ENV !== 'test') throw new Error(`${name}_UNSAFE_APP_ENV`);
  if (safety.APP_ENV === undefined && safety.appEnv !== undefined && safety.appEnv !== 'test') throw new Error(`${name}_UNSAFE_APP_ENV`);
  const ai = safety.AI_ENABLED ?? safety.aiEnabled;
  const freeze = safety.MIGRATION_FREEZE ?? safety.migrationFreeze;
  if (ai !== 'false' && ai !== false) throw new Error(`${name}_AI_NOT_DISABLED`);
  if (freeze !== 'true' && freeze !== true) throw new Error(`${name}_MIGRATION_FREEZE_NOT_ACTIVE`);
}

function assertSame(left, right, error) {
  if (left !== right) throw new Error(error);
}

export function assertPreCertificationConsistency({ regressionEvidence, integrityEvidence, releaseManifest, expectedCheckpoint, expectedCommitSha } = {}) {
  requiredString(expectedCheckpoint, 'EXPECTED_CHECKPOINT');
  requiredString(expectedCommitSha, 'EXPECTED_COMMIT_SHA');
  if (!regressionEvidence || !integrityEvidence || !releaseManifest) throw new Error('EVIDENCE_PACKAGE_INCOMPLETE');

  assertSafeEvidence(regressionEvidence, 'REGRESSION_EVIDENCE');
  assertSafeEvidence(integrityEvidence, 'INTEGRITY_EVIDENCE');
  if (releaseManifest.schemaVersion !== REQUIRED_SCHEMA) throw new Error('RELEASE_SCHEMA_UNSUPPORTED');
  if (releaseManifest.safety?.migrationFreeze !== true || releaseManifest.safety?.aiEnabled !== false) throw new Error('RELEASE_SAFETY_INVALID');

  assertSame(regressionEvidence.checkpoint, expectedCheckpoint, 'REGRESSION_CHECKPOINT_MISMATCH');
  assertSame(integrityEvidence.checkpoint, expectedCheckpoint, 'INTEGRITY_CHECKPOINT_MISMATCH');
  assertSame(releaseManifest.checkpoint, expectedCheckpoint, 'RELEASE_CHECKPOINT_MISMATCH');

  assertSame(regressionEvidence.commitSha, expectedCommitSha, 'REGRESSION_COMMIT_MISMATCH');
  assertSame(integrityEvidence.commitSha, expectedCommitSha, 'INTEGRITY_COMMIT_MISMATCH');
  assertSame(releaseManifest.commitSha, expectedCommitSha, 'RELEASE_COMMIT_MISMATCH');

  if (regressionEvidence.classification !== 'PASS') throw new Error('REGRESSION_NOT_PASS');
  if (integrityEvidence.classification !== 'PASS') throw new Error('INTEGRITY_NOT_PASS');
  if (!Array.isArray(releaseManifest.tests) || releaseManifest.tests.length === 0 || releaseManifest.tests.some((test) => test?.status !== 'PASS')) throw new Error('RELEASE_TESTS_NOT_PASS');

  if (!Number.isInteger(regressionEvidence.requiredTestCount) || regressionEvidence.requiredTestCount <= 0) throw new Error('REGRESSION_TEST_COUNT_INVALID');
  if (regressionEvidence.missingTests?.length !== 0) throw new Error('REGRESSION_MISSING_TESTS');
  if (integrityEvidence.requiredTestCount !== undefined) assertSame(integrityEvidence.requiredTestCount, regressionEvidence.requiredTestCount, 'INTEGRITY_TEST_COUNT_MISMATCH');

  const manifestTestNames = releaseManifest.tests.map((test) => test?.name).filter(Boolean);
  if (new Set(manifestTestNames).size !== manifestTestNames.length) throw new Error('RELEASE_DUPLICATE_TEST');

  return Object.freeze({
    classification: 'PASS',
    checkpoint: expectedCheckpoint,
    commitSha: expectedCommitSha,
    syntheticOnly: true,
    safety: Object.freeze({ appEnv: 'test', aiEnabled: false, migrationFreeze: true }),
    requiredTestCount: regressionEvidence.requiredTestCount,
  });
}

export function classifyPreCertificationConsistency(input) {
  try {
    return assertPreCertificationConsistency(input);
  } catch (error) {
    return Object.freeze({ classification: 'BLOCKED', reason: error instanceof Error ? error.message : 'CONSISTENCY_CHECK_FAILED' });
  }
}
