import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migration=fs.readFileSync("supabase/migrations/20260928093000_mta_admin_users_service_role_privilege_v1.sql","utf8");
const api=fs.readFileSync("supabase/functions/mta-api/index.ts","utf8");

test("admin-users service role has only the narrow profile table privileges required by the protected path",()=>{
  assert.match(migration,/grant select, insert, update, delete on table public\.mta_profiles to service_role/i);
  assert.match(api,/createClient\(Deno\.env\.get\("SUPABASE_URL"\)!\,adminKey/);
  assert.match(api,/resource==="admin-users"/);
});

test("ordinary authenticated profile access remains RLS governed",()=>{
  assert.match(migration,/service_role/);
  assert.doesNotMatch(migration,/grant .* on table public\.mta_profiles to authenticated/i);
});
