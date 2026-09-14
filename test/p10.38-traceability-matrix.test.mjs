import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const matrix = fs.readFileSync('docs/03-implementation/P10.38-PRODUCTION-READINESS-TRACEABILITY-MATRIX.md', 'utf8');

test('P10.38 traces production blockers across all critical domains', () => {
  for (const term of ['Authentication','Authorization/RBAC','RLS','Deteni registry','Placement','Movement/event ledger','Documents','Artifact handoff','Audit','Transactions','Outbox/providers','Storage','HTTP runtime','WhatsApp','Scanner/device','AI','CI evidence','Monitoring/DR']) {
    assert.match(matrix, new RegExp(term.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')));
  }
  assert.match(matrix, /READY FOR GOVERNANCE REVIEW/);
  assert.match(matrix, /READY FOR PRODUCTION/);
  assert.match(matrix, /Migration Freeze remains TRUE/);
});
