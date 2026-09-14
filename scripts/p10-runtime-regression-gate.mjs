import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const requiredTests = [
  'test/p10.1-runtime-domain-integration.test.mjs',
  'test/p10.2-placement-domain-boundary.test.mjs',
  'test/p10.3-movement-ledger-headcount.test.mjs',
  'test/p10.5-document-lifecycle.test.mjs',
  'test/p10.6-template-manifest.test.mjs',
  'test/p10.7-docx-renderer.test.mjs',
  'test/p10.8-artifact-handoff.test.mjs',
  'test/p10.9-artifact-distribution.test.mjs',
  'test/p10.10-persistent-grant-contract.test.mjs',
  'test/p10.10-persistent-grant-repository.test.mjs',
  'test/p10.11-persistent-grant-integration-readiness.test.mjs',
  'test/p10.12-database-package-contract.test.mjs',
  'test/p10.13-approved-db-integration-gate.test.mjs',
  'test/p10.14-database-verification-package.test.mjs',
  'test/p10.15-controlled-database-execution-harness.test.mjs',
  'test/p10.16-database-role-rls-verification.test.mjs',
  'test/p10.19-docx-output-contract.test.mjs',
  'test/p10.19-docx-artifact-contract.test.mjs',
  'test/p10.21-runtime-integration-contract.test.mjs',
];

const evidenceDir = 'artifacts/p10-runtime';
mkdirSync(evidenceDir, { recursive: true });

const safety = {
  APP_ENV: process.env.APP_ENV ?? null,
  AI_ENABLED: process.env.AI_ENABLED ?? null,
  MIGRATION_FREEZE: process.env.MIGRATION_FREEZE ?? null,
};

const safeGate = safety.APP_ENV === 'test' && safety.AI_ENABLED === 'false' && safety.MIGRATION_FREEZE === 'true';
const missing = requiredTests.filter((path) => {
  try {
    require('node:fs').accessSync(path);
    return false;
  } catch {
    return true;
  }
});

let classification = 'PASS';
let exitCode = 0;
let testResult = null;

if (!safeGate) {
  classification = 'BLOCKED';
  exitCode = 2;
} else if (missing.length > 0) {
  classification = 'BLOCKED';
  exitCode = 2;
} else {
  const result = spawnSync(process.execPath, ['--test', ...requiredTests], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });
  testResult = {
    exitCode: result.status,
    signal: result.signal ?? null,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
  classification = result.status === 0 ? 'PASS' : 'FAIL';
  exitCode = result.status === 0 ? 0 : 1;
}

const evidence = {
  schemaVersion: 'p10.22.v1',
  checkpoint: 'P10.22',
  classification,
  syntheticOnly: true,
  safety,
  requiredTestCount: requiredTests.length,
  missingTests: missing,
  testResult: testResult
    ? { exitCode: testResult.exitCode, signal: testResult.signal }
    : null,
  generatedAt: new Date().toISOString(),
};

writeFileSync(`${evidenceDir}/classification.json`, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
writeFileSync(
  `${evidenceDir}/test-output.txt`,
  testResult ? `${testResult.stdout}${testResult.stderr}` : `classification=${classification}\n`,
  'utf8',
);

console.log(JSON.stringify(evidence, null, 2));
process.exit(exitCode);
