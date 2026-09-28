import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migration=fs.readFileSync("supabase/migrations/20260928113000_mta_identity_credential_hardening_v1.sql","utf8");
const bootstrap=fs.readFileSync("supabase/migrations/20260928114500_mta_identity_credential_bootstrap_v1.sql","utf8");
const edge=fs.readFileSync("supabase/functions/mta-api/index.ts","utf8");
const api=fs.readFileSync("web/mta-production-api.js","utf8");
const identity=fs.readFileSync("web/identity-security-v1.js","utf8");
const users=fs.readFileSync("web/user-management-v1.js","utf8");
const index=fs.readFileSync("web/index.html","utf8");

test("credential lifecycle state is schema-level and stores no password material",()=>{
  assert.match(migration,/add column if not exists must_change_password boolean not null default false/);
  assert.match(migration,/password_changed_at timestamptz/);
  assert.match(migration,/password_reset_at timestamptz/);
  assert.match(migration,/password_reset_by uuid/);
  assert.doesNotMatch(migration,/password text/i);
  assert.match(bootstrap,/must_change_password\)\s*values\s*\(new\.id/);
});

test("self profile and password change are protected by the canonical API",()=>{
  assert.match(edge,/resource==="me"/);
  assert.match(edge,/PROFILE_DISPLAY_NAME_REQUIRED/);
  assert.match(edge,/USER_PROFILE_UPDATE/);
  assert.match(edge,/signInWithPassword\(\{email:user\.email,password:currentPassword\}\)/);
  assert.match(edge,/admin\.auth\.admin\.updateUserById\(user\.id,\{password:newPassword\}\)/);
  assert.match(edge,/CURRENT_PASSWORD_INVALID/);
  assert.match(edge,/USER_PASSWORD_CHANGE/);
  assert.match(edge,/PASSWORD_CONFIRMATION_MISMATCH/);
});

test("forced password change blocks operational API access",()=>{
  assert.match(edge,/if\(profile\.must_change_password\) return json\(req,\{ok:false,error:"PASSWORD_CHANGE_REQUIRED",role\},428\)/);
  assert.match(identity,/must_change_password/);
  assert.match(identity,/Ganti Password Wajib/);
});

test("administrative reset has OWNER boundary and forced-change semantics",()=>{
  assert.match(edge,/routeParts\[2\]==="password-reset"/);
  assert.match(edge,/RBAC_PASSWORD_RESET_DENIED/);
  assert.match(edge,/OWNER_PASSWORD_RESET_DENIED/);
  assert.match(edge,/TARGET_USER_INACTIVE/);
  assert.match(edge,/admin\.auth\.admin\.updateUserById\(id,\{password:temporaryPassword\}\)/);
  assert.match(edge,/must_change_password:true/);
  assert.match(edge,/USER_PASSWORD_RESET/);
  assert.doesNotMatch(edge,/metadata:\{[^}]*temporaryPassword/);
  assert.doesNotMatch(edge,/metadata:\{[^}]*newPassword/);
});

test("initial admin-created credentials are temporary and user management exposes credential state",()=>{
  assert.match(edge,/must_change_password:true/);
  assert.match(users,/u\.must_change_password\?'WAJIB GANTI':'NORMAL'/);
  assert.match(users,/resetPassword/);
});

test("browser has no second authentication path",()=>{
  assert.match(api,/mtaProductionApi/);
  assert.match(identity,/api\(\)\.get\('me'\)/);
  assert.match(index,/identity-security-v1\.js/);
  assert.doesNotMatch(identity,/signUp/);
});

console.log("Identity & Credential Hardening contract PASS");
