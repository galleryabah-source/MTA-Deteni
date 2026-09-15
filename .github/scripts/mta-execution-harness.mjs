import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const commit = process.env.GITHUB_SHA ?? 'unknown';
const runId = process.env.GITHUB_RUN_ID ?? 'local';
const environment = process.env.MTA_EXECUTION_ENV ?? 'controlled-nonprod';
const startedAt = new Date().toISOString();
const results = [];

function run(id, command, args) {
  const started = Date.now();
  const result = spawnSync(command, args, { encoding: 'utf8', shell: process.platform === 'win32' });
  const durationMs = Date.now() - started;
  const status = result.status === 0 ? 'PASS' : 'FAIL';
  results.push({
    controlId: id,
    status,
    exitCode: result.status,
    signal: result.signal ?? null,
    durationMs,
    stdout: (result.stdout ?? '').slice(-12000),
    stderr: (result.stderr ?? '').slice(-12000),
  });
  return result.status === 0;
}

const checks = [
  ['BUILD-5801', 'node', ['--version']],
  ['BUILD-5802', 'npm', ['--version']],
  ['BUILD-5803', 'npm', ['run', 'typecheck']],
  ['REG-5804', 'npm', ['test']],
  ['REG-5805', 'npm', ['run', 'test:unit']],
];

let failed = false;
for (const [id, command, args] of checks) {
  if (!run(id, command, args)) failed = true;
}

const completedAt = new Date().toISOString();
const payload = {
  schemaVersion: 'mta-execution-evidence/v1',
  executionId: `mta-${runId}`,
  commit,
  environment,
  startedAt,
  completedAt,
  status: failed ? 'OBSERVATION_INCOMPLETE' : 'OBSERVED_PASS',
  results,
};

mkdirSync('artifacts/mta-evidence', { recursive: true });
writeFileSync('artifacts/mta-evidence/execution.json', JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2));
process.exit(failed ? 1 : 0);
