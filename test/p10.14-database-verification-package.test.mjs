import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pkg = readFileSync(new URL('../docs/03-implementation/P10.14-DATABASE-INTEGRATION-VERIFICATION-PACKAGE.md', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/20260914_create_artifact_download_grants.sql', import.meta.url), 'utf8');
const rls = readFileSync(new URL('../docs/03-implementation/P10.12-RLS-POLICY-CONTRACT.md', import.meta.url), 'utf8');

test('P10.14 defines complete verification matrix', () => {
  for (const id of ['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16']) assert.match(pkg, new RegExp(`\\| ${id} \\|`));
  assert.match(pkg, /exactly one `rowCount = 1`/);
  assert.match(pkg, /SKIPPED_BY_SAFETY_GATE/);
});

test('P10.14 preserves deny-by-default database boundary', () => {
  assert.match(pkg, /MIGRATION_FREEZE=TRUE/);
  assert.match(pkg, /MUST refuse execution/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on table public\\.artifact_download_grants from anon/);
  assert.match(migration, /revoke all on table public\\.artifact_download_grants from authenticated/);
  assert.match(rls, /Direct browser writes to grant rows are prohibited/);
});

test('P10.14 evidence excludes sensitive payloads', () => {
  assert.match(pkg, /Never store detainee names, health information, document contents, credentials, access tokens or provider secrets/);
  assert.match(pkg, /independently observable records/);
});
