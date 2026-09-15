import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/p10-runtime.yml', 'utf8');
const status = readFileSync('PROJECT_STATUS.md', 'utf8');

test('P10.48 CI must distinguish committed lockfile from runner-generated lockfile', () => {
  assert.match(workflow, /git ls-files --error-unmatch package-lock\.json/);
  assert.match(workflow, /npm install --package-lock=false --ignore-scripts --no-audit --no-fund/);
  assert.match(workflow, /lockfileTracked=/);
  assert.match(workflow, /lockfileInstall=blocked-no-reviewed-lockfile/);
  assert.doesNotMatch(workflow, /lockfilePresent=\$\(\[ -f package-lock\.json \]\)/);
});

test('P10.48 remains fail-closed until a reviewed lockfile is committed', () => {
  assert.match(status, /P10\.48/);
  assert.match(status, /reviewed and committed `package-lock\.json`/);
  assert.match(status, /Certification:\*\* NOT CERTIFIED/);
  assert.match(status, /Migration Freeze:\*\* TRUE/);
});
