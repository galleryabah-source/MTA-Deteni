import assert from 'node:assert/strict';
import fs from 'node:fs';

const api=fs.readFileSync(new URL('../supabase/functions/mta-api/index.ts',import.meta.url),'utf8');
const login=fs.readFileSync(new URL('../supabase/functions/mta-login/index.ts',import.meta.url),'utf8');
const auth=fs.readFileSync(new URL('../web/mta-auth.js',import.meta.url),'utf8');
const authUi=fs.readFileSync(new URL('../web/mta-auth-ui.js',import.meta.url),'utf8');
const users=fs.readFileSync(new URL('../web/user-management-v1.js',import.meta.url),'utf8');
const identity=fs.readFileSync(new URL('../web/identity-security-v1.js',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../supabase/migrations/20261001090000_mta_nip_identity_contract_v1.sql',import.meta.url),'utf8');

assert.match(migration,/add column if not exists nip text/i);
assert.match(migration,/nip ~ '\^\[0-9\]\{18\}\$'/i);
assert.match(migration,/uq_mta_profiles_nip/i);
assert.match(api,/USER_NIP_INVALID/);
assert.match(api,/USER_NIP_ALREADY_EXISTS/);
assert.match(api,/^.*nip.*\^\\d\{18\}\$.*$/m);
assert.match(login,/mta_profiles/);
assert.match(login,/signInWithPassword/);
assert.match(login,/^.*nip.*\^\\d\{18\}\$.*$/m);
assert.match(auth,/api\/mta-login/);
assert.match(auth,/setSession/);
assert.match(authUi,/mtaAuthNip/);
assert.match(authUi,/NIP harus tepat 18 digit/);
assert.match(users,/name="nip"/);
assert.match(users,/NIP wajib tepat 18 angka/);
assert.match(users,/u\.nip\|\|u\.display_name/);
assert.match(identity,/label>NIP</);
console.log('NIP authentication contract: PASS');
