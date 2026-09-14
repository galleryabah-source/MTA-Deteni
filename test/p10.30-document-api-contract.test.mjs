import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const d=readFileSync('docs/03-implementation/P10.30-DOCUMENT-API-SYNTHETIC-CONTRACT-TESTS.md','utf8');
test('P10.30 document API has 15 security/output scenarios',()=>{assert.equal((d.match(/^\d+\./gm)||[]).length,15);for(const t of ['document.generate','SHA-256','download','replay','revoke','before commit'])assert.match(d,new RegExp(t,'i'));});
