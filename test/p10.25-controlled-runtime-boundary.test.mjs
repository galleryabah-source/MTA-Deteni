import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const contract = readFileSync('docs/03-implementation/P10.25-CONTROLLED-RUNTIME-BOUNDARY-PREPARATION.md','utf8');
test('P10.25 fail-closed runtime boundary',()=>{for(const t of ['authentication','authorization','scope','duty','classification','SoD','idempotent','audit','outbox','Super Admin'])assert.match(contract,new RegExp(t,'i'));});
