import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("canonical QR resolver SQL enforces active and non-expired state",()=>{
  const sql=fs.readFileSync(new URL("../supabase/migrations/20260922150000_mta_qr_resolver_active_expiry_hardening.sql",import.meta.url),"utf8");
  assert.match(sql,/q\.status\s*=\s*'ACTIVE'/);
  assert.match(sql,/q\.expires_at\s+is\s+null\s+or\s+q\.expires_at\s*>\s*now\(\)/);
  assert.match(sql,/QR_SCOPE_DENIED/);
  assert.match(sql,/QR_TOKEN_REQUIRED/);
  assert.match(sql,/private\.mta_current_role\(\)/,{message:"Resolver must remain compatible with private role helper"});
});
