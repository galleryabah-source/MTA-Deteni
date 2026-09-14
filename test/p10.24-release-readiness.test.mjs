import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/p10-runtime.yml', 'utf8');
const status = readFileSync('PROJECT_STATUS.md', 'utf8');

test('P10.24 repository release readiness preserves fail-closed safety boundaries', () => {
  assert.equal(existsSync('scripts/p10-runtime-regression-gate.mjs'), true);
  assert.equal(existsSync('scripts/p10-evidence-integrity-gate.mjs'), true);
  assert.equal(existsSync('docs/03-implementation/P10.22-CI-EVIDENCE-HARDENING-AND-RUNTIME-REGRESSION-GATE.md'), true);
  assert.equal(existsSync('docs/03-implementation/P10.23-RUNTIME-EVIDENCE-INTEGRITY-AND-RELEASE-GATE-CONSOLIDATION.md'), true);
  assert.equal(existsSync('docs/03-implementation/P10.19-CHECKPOINT-PLACEHOLDER.md'), false);
  assert.match(workflow, /APP_ENV: test/);
  assert.match(workflow, /AI_ENABLED: 'false'/);
  assert.match(workflow, /MIGRATION_FREEZE: 'true'/);
  assert.match(workflow, /if: always\(\)/);
  assert.match(workflow, /workflow_dispatch/);
  assert.doesNotMatch(workflow, /supabase db push|supabase migration up|MIGRATION_FREEZE: 'false'/i);
  assert.match(status, /Certification:\*\* NOT CERTIFIED/);
  assert.match(status, /Migration Freeze:\*\* TRUE/);
  assert.match(status, /AI:\*\* OFF/);
  assert.match(status, /Data Boundary:\*\* SYNTHETIC ONLY/);
});
