import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../supabase/migrations/20260914_create_artifact_download_grants.sql', import.meta.url), 'utf8');
const rls = readFileSync(new URL('../docs/03-implementation/P10.12-RLS-POLICY-CONTRACT.md', import.meta.url), 'utf8');
const concurrency = readFileSync(new URL('../docs/03-implementation/P10.12-POSTGRES-CONCURRENCY-TEST-PLAN.md', import.meta.url), 'utf8');
const rollback = readFileSync(new URL('../docs/03-implementation/P10.12-ROLLBACK-PLAN.md', import.meta.url), 'utf8');

test('P10.12 migration is review-only and contains required grant invariants', () => {
  assert.match(migration, /PROPOSED MIGRATION — NOT EXECUTED/);
  assert.match(migration, /artifact_download_grants_status_ck/);
  assert.match(migration, /status in \('ACTIVE', 'CONSUMED', 'REVOKED'\)/);
  assert.match(migration, /expires_at > issued_at/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on table public\.artifact_download_grants from anon/);
  assert.match(migration, /revoke all on table public\.artifact_download_grants from authenticated/);
});

test('P10.12 RLS contract remains deny-by-default', () => {
  assert.match(rls, /anonymous SELECT.*DENY/s);
  assert.match(rls, /Direct browser writes to grant rows are prohibited/);
  assert.match(rls, /Application Authorization Control Plane/);
});

test('P10.12 concurrency plan requires exactly one successful consume', () => {
  assert.match(concurrency, /exactly one transaction reports `rowCount = 1`/);
  assert.match(concurrency, /other reports `rowCount = 0`/);
  assert.match(concurrency, /no execution path results in two successful terminal transitions/);
});

test('P10.12 rollback plan is explicit and migration-frozen', () => {
  assert.match(rollback, /controlled archival procedure rather than destructive `DROP TABLE`/);
  assert.match(rollback, /No rollback operation is executed.*MIGRATION_FREEZE=TRUE/s);
});
