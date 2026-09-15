import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const p='docs/03-implementation/P10.42-CONTROLLED-POSTGRESQL-RLS-EXECUTION-RUNBOOK.md';
test('P10.42 is prepared-only and fail-closed',()=>{const s=readFileSync(p,'utf8');assert.match(s,/PREPARED ONLY/);assert.match(s,/Migration Freeze/);assert.match(s,/Abort on mismatch/);assert.match(s,/Rollback is a governed operation/);});
test('P10.42 covers database security and transaction evidence',()=>{const s=readFileSync(p,'utf8');for(const x of ['RLS','actor identity','scope','concurrency','idempotency','audit','outbox','post-commit'])assert.match(s,new RegExp(x,'i'));});
