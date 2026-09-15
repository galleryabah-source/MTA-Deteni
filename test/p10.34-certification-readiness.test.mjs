import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const d=readFileSync('docs/03-implementation/P10.34-SECURITY-CERTIFICATION-READINESS.md','utf8');
test('P10.34 remains fail-closed',()=>{assert.match(d,/NOT CERTIFIED/);assert.match(d,/No evidence = not PASS/);assert.match(d,/Migration Freeze/);assert.match(d,/AI-OFF/);for(const t of ['authentication','RBAC','audit','PostgreSQL','RLS','provider','HTTP'])assert.match(d,new RegExp(t,'i'));});
