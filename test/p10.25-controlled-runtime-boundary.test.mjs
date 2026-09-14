import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const contract = readFileSync('docs/03-implementation/P10.25-CONTROLLED-RUNTIME-BOUNDARY-PREPARATION.md', 'utf8');
const workflow = readFileSync('.github/workflows/p10-runtime.yml', 'utf8');

test('P10.25 controlled runtime boundary is fail-closed', () => {
  for (const term of ['authentication', 'authorization', 'scope', 'duty', 'classification', 'SoD', 'idempotent', 'audit', 'outbox']) assert.match(contract, new RegExp(term, 'i'));
  assert.match(contract, /Super Admin.*operational authority/i);
  assert.match(contract, /Provider\/network.*only after commit/i);
  assert.match(workflow, /APP_ENV: test/);
  assert.match(workflow, /AI_ENABLED: 'false'/);
  assert.match(workflow, /MIGRATION_FREEZE: 'true'/);
});
