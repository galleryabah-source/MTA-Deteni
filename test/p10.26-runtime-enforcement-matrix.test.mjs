import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const m=readFileSync('docs/03-implementation/P10.26-RUNTIME-ENFORCEMENT-MATRIX.md','utf8');
test('P10.26 enforcement matrix covers protected classes and IDOR',()=>{for(const t of ['Protected read','Standard write','Leave transition','Document issue','Artifact download','RBAC mutation','IDOR','negative-test'])assert.match(m,new RegExp(t,'i'));});
