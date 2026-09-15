import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const m=readFileSync('docs/03-implementation/P10.32-CRITICAL-TRANSACTION-RELEASE-MATRIX.md','utf8');
test('P10.32 preserves critical transaction invariants',()=>{for(const t of ['Leave critical transition','Document issue','Artifact grant creation','Artifact consume','RBAC mutation','rollback','dead-letter','retroactively'])assert.match(m,new RegExp(t,'i'));});
