import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gate = readFileSync(new URL('../docs/03-implementation/P10.13-APPROVED-DATABASE-INTEGRATION-GATE.md', import.meta.url), 'utf8');
const identity = readFileSync(new URL('../docs/03-implementation/P10.13-IDENTITY-SCOPE-RLS-FINALIZATION.md', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/20260914_create_artifact_download_grants.sql', import.meta.url), 'utf8');

 test('P10.13 gate remains blocked while migration freeze is active', () => {
  assert.match(gate, /MIGRATION_FREEZE=TRUE/);
  assert.match(gate, /No DDL or production connection is authorized/);
  assert.match(gate, /explicit governance approval to lift Migration Freeze/);
});

test('P10.13 identity and scope mapping fails closed', () => {
  assert.match(identity, /client-supplied scope is never trusted/);
  assert.match(identity, /Any missing, ambiguous or conflicting mapping MUST fail closed/);
  assert.match(identity, /inactive actor.*DENY/s);
  assert.match(identity, /revoked scope membership.*DENY/s);
});

test('P10.13 preserves migration review-only boundary', () => {
  assert.match(migration, /PROPOSED MIGRATION — NOT EXECUTED/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on table public\.artifact_download_grants from anon/);
  assert.match(migration, /revoke all on table public\.artifact_download_grants from authenticated/);
});

test('P10.13 requires observable evidence before certification', () => {
  assert.match(gate, /CI evidence is missing or non-observable/);
  assert.match(gate, /independently observable evidence/);
  assert.match(gate, /exactly one successful consume/);
});
