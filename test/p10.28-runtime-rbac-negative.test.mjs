import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const m=readFileSync('docs/03-implementation/P10.28-RUNTIME-RBAC-NEGATIVE-TEST-MATRIX.md','utf8');
test('P10.28 deny-by-default matrix has 15 scenarios',()=>{assert.equal((m.match(/RT-RBAC-\d{3}/g)||[]).length,15);for(const t of ['unauthenticated','wrong scope','inactive duty','SoD','Super Admin','IDOR','idempotency','provider'])assert.match(m,new RegExp(t,'i'));});
