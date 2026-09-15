import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const contract = fs.readFileSync('docs/03-implementation/P10.18-DOCUMENT-OUTPUT-OPERATIONALIZATION-PACKAGE-v2.md', 'utf8');

test('P10.18 requires both controlled Word outputs', () => {
  assert.match(contract, /TEMPORARY_EXIT_PERMISSION/);
  assert.match(contract, /ESCORT_ASSIGNMENT_LETTER/);
  assert.match(contract, /\.docx/);
});

test('P10.18 preserves template governance and SoD', () => {
  assert.match(contract, /immutable template ID\/version/i);
  assert.match(contract, /SHA-256/);
  assert.match(contract, /PREPARER/);
  assert.match(contract, /APPROVER/);
  assert.match(contract, /ISSUER/);
  assert.match(contract, /separation of duties/i);
});

test('P10.18 preserves secure handoff and transaction isolation', () => {
  assert.match(contract, /single-use grant/);
  assert.match(contract, /exactly one successful transition/);
  assert.match(contract, /audit and outbox share one transaction client/);
  assert.match(contract, /only after commit/);
});

test('P10.18 remains synthetic and fail-closed', () => {
  assert.match(contract, /MIGRATION_FREEZE=TRUE/);
  assert.match(contract, /AI is OFF/);
  assert.match(contract, /SKIPPED_BY_SAFETY_GATE/);
  assert.match(contract, /no detainee PII/i);
});
