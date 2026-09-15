import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const contract = fs.readFileSync('docs/03-implementation/P10.18-DOCUMENT-OUTPUT-OPERATIONALIZATION-PACKAGE.md', 'utf8');
const status = fs.readFileSync('PROJECT_STATUS.md', 'utf8');

for (const kind of ['TEMPORARY_EXIT_PERMISSION', 'ESCORT_ASSIGNMENT_LETTER']) {
  test(`${kind} is a required Word output`, () => {
    assert.match(contract, new RegExp(kind));
    assert.match(contract, /\.docx/);
  });
}

test('template governance is deterministic', () => {
  assert.match(contract, /immutable version/);
  assert.match(contract, /template SHA-256/);
  assert.match(contract, /permitted data sources/);
});

test('issuance requires lifecycle and separation of duties', () => {
  assert.match(contract, /DRAFT → PENDING_APPROVAL → APPROVED → ISSUED/);
  assert.match(contract, /PREPARER/);
  assert.match(contract, /APPROVER/);
  assert.match(contract, /ISSUER/);
  assert.match(contract, /SoD/);
});

test('artifact and secure handoff are cryptographically bound', () => {
  assert.match(contract, /SHA-256 checksum/);
  assert.match(contract, /artifact ID/);
  assert.match(contract, /actor ID/);
  assert.match(contract, /scope ID/);
  assert.match(contract, /ACTIVE → CONSUMED/);
});

test('safety boundary remains fail-closed', () => {
  assert.match(contract, /MIGRATION_FREEZE=TRUE/);
  assert.match(contract, /SKIPPED_BY_SAFETY_GATE/);
  assert.match(contract, /provider\/network would execute before transaction commit/);
  assert.match(status, /AI:\*\* OFF/);
  assert.match(status, /Data Boundary:\*\* SYNTHETIC ONLY/);
  assert.match(status, /Certification:\*\* NOT CERTIFIED/);
});
