import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const p='docs/03-implementation/P10.44-PRODUCTION-CUTOVER-ROLLBACK-GATE.md';
test('P10.44 defaults to blocked and separates approval from activation',()=>{const s=readFileSync(p,'utf8');assert.match(s,/Default disposition:\*\* BLOCKED/);assert.match(s,/No automatic activation/);assert.match(s,/certification remain separate gates/);});
test('P10.44 includes critical production controls',()=>{const s=readFileSync(p,'utf8');for(const x of ['RLS','authentication','RBAC','DOCX','audit','outbox','WhatsApp','scanner/device','monitoring','DR','dead-letter','SoD'])assert.match(s,new RegExp(x,'i'));});
