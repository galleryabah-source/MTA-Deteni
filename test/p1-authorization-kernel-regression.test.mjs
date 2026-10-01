import assert from 'node:assert/strict';
import fs from 'node:fs';

const api=fs.readFileSync('supabase/functions/mta-api/index.ts','utf8');

assert.match(api,/const AUTHZ_POLICY_VERSION="AUTHZ-DB-RLS-v1"/);
assert.match(api,/const MUTATION_ROLE_POLICY=/);
assert.match(api,/detainees:\{POST:new Set\(\["OWNER","ADMIN","EDITOR"\]\),PATCH:new Set\(\["OWNER","ADMIN","EDITOR"\]\),DELETE:new Set\(\["OWNER","ADMIN"\]\)\}/);
assert.match(api,/placements:\{POST:new Set\(\["OWNER","ADMIN","EDITOR"\]\),PATCH:new Set\(\["OWNER","ADMIN","EDITOR"\]\),DELETE:new Set\(\["OWNER","ADMIN"\]\)\}/);
assert.match(api,/movements:\{POST:new Set\(\["OWNER","ADMIN","EDITOR"\]\),PATCH:new Set\(\["OWNER","ADMIN","EDITOR"\]\),DELETE:new Set\(\["OWNER","ADMIN"\]\)\}/);
assert.match(api,/leaves:\{POST:new Set\(\["OWNER","ADMIN","EDITOR"\]\),PATCH:new Set\(\["OWNER","ADMIN","EDITOR"\]\),DELETE:new Set\(\["OWNER","ADMIN"\]\)\}/);
assert.match(api,/documents:\{POST:new Set\(\["OWNER","ADMIN","EDITOR"\]\),PATCH:new Set\(\["OWNER","ADMIN","EDITOR"\]\),DELETE:new Set\(\["OWNER","ADMIN"\]\)\}/);
assert.match(api,/blocks:\{POST:new Set\(\["OWNER","ADMIN"\]\),PATCH:new Set\(\["OWNER","ADMIN"\]\),DELETE:new Set\(\["OWNER","ADMIN"\]\)\}/);
assert.match(api,/rooms:\{POST:new Set\(\["OWNER","ADMIN"\]\),PATCH:new Set\(\["OWNER","ADMIN"\]\),DELETE:new Set\(\["OWNER","ADMIN"\]\)\}/);

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
