import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const workflow = readFileSync('.github/workflows/p10-runtime.yml', 'utf8');

test('P10.47: CI workflow has a non-secret transport diagnostic and always uploads evidence', () => {
  assert.match(workflow, /CI transport diagnostic/);
  assert.match(workflow, /GITHUB_SHA/);
  assert.match(workflow, /node --version/);
  assert.match(workflow, /npm --version/);
  assert.match(workflow, /package-lock\.json/);
  assert.match(workflow, /if: always\(\)/);
  assert.match(workflow, /ci-transport-diagnostic\.txt/);
  assert.doesNotMatch(workflow, /printenv\b/);
  assert.doesNotMatch(workflow, /echo .*secrets\./);
});
