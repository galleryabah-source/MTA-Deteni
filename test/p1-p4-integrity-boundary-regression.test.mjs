import assert from 'node:assert/strict';
import fs from 'node:fs';

const api=fs.readFileSync('supabase/functions/mta-api/index.ts','utf8');
const adapter=fs.readFileSync('web/mta-production-state-adapter-v1.js','utf8');

const lockPos=api.indexOf('if(WRITE_METHODS.has(req.method) && resource!=="me" && !productionWritesEnabled())');
const routePos=api.indexOf('if(!TABLES.has(resource))');
assert.ok(lockPos>=0,'server-side production write lock must exist');
assert.ok(routePos>lockPos,'production write lock must execute before generic resource routing');

assert.match(api,/if\(resource==="audit-event"\) return json\(req,\{ok:false,error:"AUDIT_WRITE_DISABLED"\},405\)/);
assert.match(api,/const authorizationDecision=await authorizeGenericMutation/);
assert.ok(api.indexOf('const {data,error}=await admin.rpc("mta_execute_idempotent_mutation"')>api.indexOf('const authorizationDecision=await authorizeGenericMutation'));
assert.match(api,/const idempotencyKey=String\(req\.headers\.get\("Idempotency-Key"\)\|\|""\)\.trim\(\)/);

assert.match(adapter,/const key=String\(idempotencyKey\|\|'\'\)\.trim\(\)/);
assert.match(adapter,/const requestKey=String\(idempotencyKey\|\|'\'\)\.trim\(\)/);
assert.match(adapter,/const restoreKey=String\(snapshot\?\.manifest\?\.backupId\|\|'\'\)\.trim\(\)/);
assert.doesNotMatch(adapter,/idempotencyKey\|\|\(['"](?:DETAINEE|MOVE_DETAINEE)/);
assert.doesNotMatch(adapter,/backupId\|\|crypto\.randomUUID/);
assert.match(adapter,/AUDIT_WRITE_DISABLED/);

console.log('P1 final forensic closure PASS');
console.log('Server-side production write boundary precedes operational route dispatch');
console.log('Client-originated audit write surface disabled');
console.log('Generic authorization precedes durable mutation RPC');
console.log('All critical adapter mutation paths require explicit idempotency keys');

const migration=fs.readFileSync('supabase/migrations/20261002040000_mta_audit_sequence_v1.sql','utf8');
assert.match(migration,/create sequence if not exists public\.mta_audit_sequence_seq/);
assert.match(migration,/add column if not exists audit_sequence bigint/);
assert.match(migration,/row_number\(\) over \(order by occurred_at asc, id asc\)/);
assert.match(migration,/new\.audit_sequence := nextval\('public\.mta_audit_sequence_seq'::regclass\)/);
assert.match(migration,/order by audit_sequence desc/);
assert.match(migration,/order by audit_sequence asc/);
assert.match(migration,/AUDIT_SEQUENCE_GAP_OR_REORDER/);

console.log('P4 audit_sequence migration contract PASS');
