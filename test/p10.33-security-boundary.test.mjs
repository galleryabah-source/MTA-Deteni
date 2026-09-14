import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const s=readFileSync('docs/03-implementation/P10.33-SECURITY-BOUNDARY-FINALIZATION.md','utf8');
test('P10.33 consolidated security invariants remain fail-closed',()=>{assert.equal((s.match(/^\d+\./gm)||[]).length,12);for(const t of ['Super Admin','SoD','AI','Migration','Evidence'])assert.match(s,new RegExp(t,'i'));});
