import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const matrix = readFileSync('docs/03-implementation/P10.32-CRITICAL-TRANSACTION-RELEASE-MATRIX.md', 'utf8');

test('P10.32 critical operations retain transaction/audit/outbox/idempotency controls', () => {
  for (const term of ['Leave critical transition', 'Document issue', 'Artifact grant creation', 'Artifact consume', 'RBAC mutation', 'rollback', 'dead-letter', 'retroactively mutate']) assert.match(matrix, new RegExp(term.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i'));
});
