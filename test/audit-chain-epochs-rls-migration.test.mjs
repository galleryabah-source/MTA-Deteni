import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("audit chain epoch metadata is closed to direct client roles without forcing RLS on trigger owner", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20261013093000_mta_audit_chain_epochs_rls_v1.sql", import.meta.url), "utf8");
  assert.match(migration, /alter table public\.mta_audit_chain_epochs enable row level security/i);
  assert.match(migration, /alter table public\.mta_audit_chain_epochs no force row level security/i);
  assert.match(migration, /revoke all on table public\.mta_audit_chain_epochs from anon, authenticated, service_role/i);
  assert.doesNotMatch(migration, /create policy/i);
  assert.match(migration, /SECURITY DEFINER/i);
});
