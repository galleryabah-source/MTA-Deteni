import assert from 'node:assert/strict';
import fs from 'node:fs';

const api=fs.readFileSync('supabase/functions/mta-api/index.ts','utf8');

assert.match(api,/const AUTHZ_POLICY_VERSION="AUTHZ-DB-RLS-v1"/);
assert.match(api,/const MUTATION_ROLE_POLICY=/);
const policyStart=api.indexOf("const MUTATION_ROLE_POLICY={");
const policyEnd=api.indexOf("};",policyStart);
const policy=api.slice(policyStart,policyEnd);
assert.match(policy,/detainees:\{POST:new Set\(\["OWNER","ADMIN","EDITOR"\]\),PATCH:new Set\(\["OWNER","ADMIN","EDITOR"\]\)\}/);
assert.doesNotMatch(policy,/detainees:\{[^}]*DELETE:/);
assert.doesNotMatch(policy,/placements:/);
assert.doesNotMatch(policy,/movements:/);
assert.doesNotMatch(policy,/leaves:/);
assert.doesNotMatch(policy,/documents:/);
assert.match(policy,/blocks:\{POST:new Set\(\["OWNER","ADMIN"\]\)\}/);
assert.match(policy,/rooms:\{POST:new Set\(\["OWNER","ADMIN"\]\)\}/);







assert.match(api,/const authorizeGenericMutation=async/);
assert.match(api,/return denyAuthorization\("PERMISSION_DENIED"\)/);
assert.match(api,/return denyAuthorization\("SCOPE_DENIED"\)/);
assert.match(api,/return denyAuthorization\("SCOPE_REQUIRED"\)/);
assert.match(api,/return allowAuthorization\(\)/);

const authzPos=api.indexOf('const authorizationDecision=await authorizeGenericMutation');
const mutationPos=api.indexOf('const {data,error}=await admin.rpc("mta_execute_idempotent_mutation"');
assert.ok(authzPos>=0,'generic mutation must have an authorization decision');
assert.ok(mutationPos>authzPos,'authorization must execute before the durable mutation RPC');

assert.match(api,/policyVersion:authorizationDecision\.policyVersion/);
assert.match(api,/authorization\.denied/);

console.log('P1 authorization-kernel regression contract PASS');
console.log('Role policy source: existing Supabase RLS mutation policies');
console.log('Scope policy: authenticated profile scope for scoped resources');
console.log('Generic service-role mutation cannot execute before authorization decision');

const adapter=fs.readFileSync('web/mta-production-state-adapter-v1.js','utf8');
assert.match(adapter,/const key=String\(idempotencyKey\|\|'\'\)\.trim\(\)/);
assert.doesNotMatch(adapter,/idempotencyKey\|\|\(['"](?:DETAINEE|MOVE_DETAINEE)/);
assert.doesNotMatch(adapter,/backupId\|\|crypto\.randomUUID/);
console.log('P1 client idempotency-key strictness PASS');
