import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/mta-domain-ci.yml', 'utf8');
const doc = readFileSync('docs/03-implementation/P10.45-CI-EVIDENCE-TRANSPORT-HARDENING.md', 'utf8');

test('P10.45 does not use npm ci without a lockfile', () => {
  assert.equal(existsSync('package-lock.json'), false);
  assert.doesNotMatch(workflow, /npm ci/);
  assert.match(workflow, /run: npm install/);
});

test('P10.45 preserves fail-closed CI evidence semantics', () => {
  assert.match(doc, /PASS/);
  assert.match(doc, /FAIL/);
  assert.match(doc, /BLOCKED/);
  assert.match(doc, /BlobNotFound/);
  assert.match(doc, /not sufficient to claim a code failure/);
});

test('P10.45 keeps production safety boundaries', () => {
  assert.match(doc, /Migration Freeze/);
  assert.match(doc, /AI remains OFF/);
  assert.match(doc, /synthetic/);
  assert.match(doc, /package-lock\\.json/);
});
