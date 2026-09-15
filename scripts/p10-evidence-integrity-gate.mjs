import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const evidencePath = 'artifacts/p10-runtime/classification.json';
const outputPath = 'artifacts/p10-runtime/test-output.txt';
const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
const output = readFileSync(outputPath, 'utf8');
const failures = [];

// P10.140 is the current evidence checkpoint. The schema identifier remains
// stable for backwards-compatible evidence consumers; checkpoint is authoritative.
if (evidence.schemaVersion !== 'p10.22.v1') failures.push('UNSUPPORTED_EVIDENCE_SCHEMA');
if (evidence.checkpoint !== 'P10.140') failures.push('WRONG_CHECKPOINT');
if (evidence.syntheticOnly !== true) failures.push('NON_SYNTHETIC_EVIDENCE');
if (evidence.safety?.APP_ENV !== 'test') failures.push('UNSAFE_APP_ENV');
if (evidence.safety?.AI_ENABLED !== 'false') failures.push('AI_NOT_DISABLED');
if (evidence.safety?.MIGRATION_FREEZE !== 'true') failures.push('MIGRATION_FREEZE_NOT_ACTIVE');
if (!Number.isInteger(evidence.requiredTestCount) || evidence.requiredTestCount <= 0) failures.push('INVALID_REQUIRED_TEST_COUNT');
if (!Array.isArray(evidence.missingTests) || evidence.missingTests.length) failures.push('MISSING_REQUIRED_TESTS');
if (!['PASS', 'FAIL', 'BLOCKED'].includes(evidence.classification)) failures.push('INVALID_CLASSIFICATION');

const expectedSha = process.env.GITHUB_SHA ?? null;
if (expectedSha && evidence.commitSha !== expectedSha) failures.push('COMMIT_MISMATCH');

const outputSha = createHash('sha256').update(output).digest('hex');
if (evidence.testOutputSha256 !== outputSha) failures.push('OUTPUT_HASH_MISMATCH');

const result = {
  schemaVersion: 'p10.23.v2',
  checkpoint: 'P10.140',
  classification: failures.length ? 'FAIL' : 'PASS',
  evidenceClassification: evidence.classification,
  evidenceCommitSha: evidence.commitSha ?? null,
  expectedCommitSha: expectedSha,
  requiredTestCount: evidence.requiredTestCount,
  outputSha256: outputSha,
  failures,
  verifiedAt: new Date().toISOString(),
};

writeFileSync('artifacts/p10-runtime/integrity.json', `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result, null, 2));
process.exit(failures.length ? 1 : 0);
