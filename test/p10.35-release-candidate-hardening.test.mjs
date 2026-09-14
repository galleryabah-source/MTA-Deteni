import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const status = fs.readFileSync('PROJECT_STATUS.md', 'utf8');
const workflow = fs.readFileSync('.github/workflows/p10-runtime.yml', 'utf8');
const spec = fs.readFileSync('docs/03-implementation/P10.35-RELEASE-CANDIDATE-HARDENING.md', 'utf8');

test('P10.35 release candidate remains fail-closed', () => {
  assert.match(status, /Certification:\*\* NOT CERTIFIED/);
  assert.match(status, /Migration Freeze:\*\* TRUE/);
  assert.match(status, /AI:\*\* OFF/);
  assert.match(status, /Data Boundary:\*\* SYNTHETIC ONLY/);
  assert.match(workflow, /AI_ENABLED: 'false'/);
  assert.match(workflow, /MIGRATION_FREEZE: 'true'/);
  assert.match(workflow, /Verify immutable synthetic safety gate/);
  assert.match(workflow, /Upload P10 evidence/);
  assert.match(spec, /No certification claim is valid without independently observable CI evidence/);
});

test('P10.35 retains protected document and transaction invariants', () => {
  for (const phrase of [
    'Authorization is deny-by-default and server-enforced.',
    'Super Admin does not imply operational authority.',
    'persistent single-use grant',
    'Critical mutations commit domain state, audit and outbox atomically.',
    'External providers are post-commit only.',
    'Idempotency prevents duplicate critical effects',
  ]) assert.match(spec, new RegExp(phrase.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')));
});
