import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const matrix = fs.readFileSync('docs/03-implementation/P10.36-RELEASE-CANDIDATE-OPERATIONAL-SCENARIO-MATRIX.md', 'utf8');

test('P10.36 contains complete fail-closed operational scenario matrix', () => {
  for (const id of ['O36.1','O36.2','O36.3','O36.4','O36.5','O36.6','O36.7','O36.8','O36.9','O36.10','O36.11','O36.12','O36.13','O36.14','O36.15','O36.16','O36.17','O36.18']) {
    assert.match(matrix, new RegExp(id));
  }
  assert.match(matrix, /Exactly one terminal transition/);
  assert.match(matrix, /Atomic rollback/);
  assert.match(matrix, /Provider failure after commit/);
  assert.match(matrix, /Evidence tampering/);
});
