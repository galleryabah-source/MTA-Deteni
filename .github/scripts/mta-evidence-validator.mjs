import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? 'artifacts/mta-evidence/execution.json';
const evidence = JSON.parse(readFileSync(path, 'utf8'));
const failures = [];

if (evidence.schemaVersion !== 'mta-execution-evidence/v1') failures.push('schemaVersion');
if (!evidence.executionId?.trim()) failures.push('executionId');
if (!evidence.commit?.trim() || evidence.commit === 'unknown') failures.push('commit');
if (evidence.environment !== 'controlled-nonprod') failures.push('environment');
if (evidence.status !== 'OBSERVED_PASS') failures.push('status');
if (!Array.isArray(evidence.results) || evidence.results.length < 5) failures.push('results-count');

if (Array.isArray(evidence.results)) {
  const ids = new Set();
  for (const result of evidence.results) {
    if (!result.controlId?.trim()) failures.push('controlId');
    if (ids.has(result.controlId)) failures.push('duplicate-controlId');
    ids.add(result.controlId);
    if (result.status !== 'PASS' || result.exitCode !== 0) failures.push(`failed-check:${result.controlId}`);
  }
}

if (failures.length) {
  console.error(`CONTROLLED_EVIDENCE_INVALID: ${failures.join(',')}`);
  process.exit(1);
}

console.log('CONTROLLED_EVIDENCE_VALID');
