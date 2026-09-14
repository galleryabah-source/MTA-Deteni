import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const matrix = readFileSync('docs/03-implementation/P10.26-RUNTIME-ENFORCEMENT-MATRIX.md', 'utf8');

test('P10.26 every sensitive runtime class has security enforcement points', () => {
  for (const term of ['Protected read', 'Standard write', 'Leave transition', 'Document issue', 'Artifact download', 'RBAC mutation', 'IDOR protection', 'Release gate']) assert.match(matrix, new RegExp(term.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i'));
  assert.match(matrix, /client.*untrusted/i);
  assert.match(matrix, /negative test/i);
});
