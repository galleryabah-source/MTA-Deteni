import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api=fs.readFileSync("supabase/functions/mta-api/index.ts","utf8");

test("admin user creation reconciles with Auth profile trigger",()=>{
  assert.match(api,/admin\.auth\.admin\.createUser\(\{email,password,email_confirm:true/);
  assert.match(api,/admin\.from\("mta_profiles"\)\.upsert\(\{id:uid,role:requestedRole,display_name:displayName\|\|email,active:true\},\{onConflict:"id"\}\)/);
  assert.doesNotMatch(api,/admin\.from\("mta_profiles"\)\.insert\(\{id:uid,role:requestedRole/);
});
