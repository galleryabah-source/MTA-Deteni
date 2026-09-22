import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui=fs.readFileSync('web/mta-auth-ui.js','utf8');
const api=fs.readFileSync('supabase/functions/mta-api/index.ts','utf8');
const auth=fs.readFileSync('web/mta-auth.js','utf8');
const productionApi=fs.readFileSync('web/mta-production-api.js','utf8');

const roles=['OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR'];
const actionPolicy={
  READ:['OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR'],
  CREATE:['OWNER','ADMIN','EDITOR'],
  UPDATE:['OWNER','ADMIN','EDITOR'],
  DELETE:['OWNER','ADMIN'],
  APPROVE:['OWNER','ADMIN','REVIEWER'],
  FINALIZE:['OWNER','ADMIN'],
  AUDIT:['OWNER','ADMIN','AUDITOR']
};

for(const role of roles) assert.match(ui,new RegExp(role),role+' must be represented in client RBAC');
for(const [action,allowed] of Object.entries(actionPolicy)){
  const line=ui.match(new RegExp(action+':\\[([^\\]]+)\\]'));
  assert.ok(line,action+' must have explicit client policy');
  for(const role of allowed) assert.ok(line[1].includes(role),action+' must allow '+role);
  for(const role of roles.filter(r=>!allowed.includes(r))) assert.ok(!line[1].includes(role),action+' must deny '+role);
}

const apiPolicy={
  GET:['OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR'],
  POST:['OWNER','ADMIN','EDITOR'],
  PATCH:['OWNER','ADMIN','EDITOR'],
  DELETE:['OWNER','ADMIN']
};
for(const [method,allowed] of Object.entries(apiPolicy)){
  const line=api.match(new RegExp(method+':new Set\\(\\[([^\\]]+)\\]\\)'));
  assert.ok(line,method+' must have explicit API policy');
  for(const role of allowed) assert.ok(line[1].includes('"'+role+'"'),method+' must allow '+role);
  for(const role of roles.filter(r=>!allowed.includes(r))) assert.ok(!line[1].includes('"'+role+'"'),method+' must deny '+role);
}

assert.match(api,/CANONICAL_ROLES=new Set\(\["OWNER","ADMIN","EDITOR","REVIEWER","AUDITOR"\]\)/);
assert.match(api,/RBAC_ROLE_INVALID/);
assert.match(api,/RBAC_ACTION_DENIED/);
assert.match(api,/RBAC_PROFILE_MISSING_OR_INACTIVE/);
assert.match(api,/supabase\.auth\.getUser\(\)/);
assert.match(api,/\.eq\("id",user\.id\)/);
assert.match(productionApi,/Authorization:'Bearer '\+accessToken/);
assert.doesNotMatch(auth,/client:supabase/);
assert.doesNotMatch(auth,/window\.mtaAuth\.client/);

console.log('RBAC_E2E_PRIVILEGE_CONTRACT PASS');
