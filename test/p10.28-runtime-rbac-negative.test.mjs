import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const matrix = readFileSync('docs/03-implementation/P10.28-RUNTIME-RBAC-NEGATIVE-TEST-MATRIX.md', 'utf8');

test('P10.28 preserves deny-by-default runtime RBAC scenarios', () => {
  const ids = [...matrix.matchAll(/RT-RBAC-\d{3}/g)].map((m) => m[0]);
  assert.equal(new Set(ids).size, 15);
  for (const term of ['unauthenticated', 'wrong scope', 'inactive duty', 'SoD', 'Super Admin', 'IDOR', 'idempotency', 'provider']) assert.match(matrix, new RegExp(term, 'i'));
  assert.match(matrix, /Absence of evidence is not PASS/i);
});
