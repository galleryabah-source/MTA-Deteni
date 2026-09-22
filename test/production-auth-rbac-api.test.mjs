import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration=fs.readFileSync('supabase/migrations/20260921060500_mta_deteni_production_activation_foundation.sql','utf8');
const rbac=fs.readFileSync('supabase/migrations/20260921070000_mta_production_auth_rbac_v1.sql','utf8');
const edge=fs.readFileSync('supabase/functions/mta-api/index.ts','utf8');
const client=fs.readFileSync('web/mta-production-api.js','utf8');
const auth=fs.readFileSync('web/mta-auth.js','utf8');

assert.match(rbac,/create table if not exists public\.mta_profiles/);
assert.match(rbac,/check \(role in \('OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR','VIEWER'\)\)/);
assert.match(rbac,/alter table public\.mta_profiles enable row level security/);
assert.match(rbac,/mta_detainees_insert_editor/);
assert.match(rbac,/mta_detainees_delete_admin/);
assert.match(rbac,/mta_audit_row_change/);
assert.match(rbac,/security definer/);

assert.match(edge,/supabase\.auth\.getUser\(\)/);
assert.match(edge,/RBAC_WRITE_DENIED/);
assert.match(edge,/const TABLES=new Set\(\["detainees","placements","movements","leaves","documents"\]\)/);
assert.equal(edge.includes('const table="mta_"+resource;'),true);
assert.doesNotMatch(edge,/detail:error\.message/);
assert.doesNotMatch(edge,/detail:String\(error\)/);

assert.match(client,/mtaProductionApi/);
assert.match(auth,/signInWithPassword/);
assert.match(auth,/adminRegister/);
assert.doesNotMatch(auth,/signUp\(/);
assert.match(edge,/admin-register/);
assert.match(edge,/RBAC_REGISTER_DENIED/);
assert.match(edge,/SUPABASE_SERVICE_ROLE_KEY/);
assert.match(edge,/PASSWORD_POLICY_MIN_12/);
assert.match(auth,/onAuthStateChange/);
assert.match(migration,/production activation/i);

assert.match(fs.readFileSync('web/mta-auth-ui.js','utf8'),/Login MTA DETENI/);
assert.match(fs.readFileSync('web/mta-auth-ui.js','utf8'),/\.app\\{display:none!important\\}/);
assert.match(fs.readFileSync('web/mta-auth-ui.js','utf8'),/mta-authenticated/);
assert.match(fs.readFileSync('web/mta-auth-ui.js','utf8'),/OWNER.*ADMIN/);
assert.doesNotMatch(fs.readFileSync('web/mta-auth-ui.js','utf8'),/Daftar Akun/);
assert.match(fs.readFileSync('worker-v11.js','utf8'),/X-Frame-Options/);
assert.match(fs.readFileSync('worker-v11.js','utf8'),/AUTH_REQUIRED/);
assert.match(fs.readFileSync('worker-v11.js','utf8'),/Content-Security-Policy-Report-Only/);
console.log('Production Auth/RBAC API contract PASS');
