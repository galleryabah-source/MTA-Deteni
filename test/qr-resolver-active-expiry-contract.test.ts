import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("canonical QR resolver SQL enforces active and non-expired state",()=>{
  const sql=fs.readFileSync(new URL("../supabase/migrations/20260922150000_mta_qr_resolver_active_expiry_hardening.sql",import.meta.url),"utf8");
  assert.match(sql,/q\.status\s*=\s*'ACTIVE'/);
  assert.match(sql,/q\.expires_at\s+is\s+null\s+or\s+q\.expires_at\s*>\s*now\(\)/);
  assert.match(sql,/QR_SCOPE_DENIED/);
  assert.match(sql,/QR_TOKEN_REQUIRED/);
});


test("QR resolver is SECURITY INVOKER and authenticated domain grants remain RLS-mediated",()=>{
  const resolver=fs.readFileSync(new URL("../supabase/migrations/20260922154500_mta_qr_resolver_invoker_hardening.sql",import.meta.url),"utf8");
  const grants=fs.readFileSync(new URL("../supabase/migrations/20260922153000_mta_authenticated_domain_table_grants.sql",import.meta.url),"utf8");
  assert.match(resolver,/security invoker/);
  assert.match(resolver,/grant select on table public\.mta_qr_registry to authenticated/);
  assert.match(grants,/grant select, insert, update, delete on table/);
  assert.match(grants,/to authenticated/);
});
