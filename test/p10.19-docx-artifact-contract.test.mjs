import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const contract = fs.readFileSync('docs/03-implementation/P10.18-DOCUMENT-OUTPUT-OPERATIONALIZATION-PACKAGE.md', 'utf8');

const requiredKinds = [
  'TEMPORARY_EXIT_PERMISSION',
  'ESCORT_ASSIGNMENT_LETTER',
];

for (const kind of requiredKinds) {
  test(`P10.19 requires ${kind} output contract`, () => {
    assert.match(contract, new RegExp(kind));
    assert.match(contract, /\.docx/);
    assert.match(contract, /template ID and immutable version/);
    assert.match(contract, /template SHA-256/);
  });
}

test('P10.19 requires lifecycle and separation of duties before official issuance', () => {
  assert.match(contract, /DRAFT → PENDING_APPROVAL → APPROVED → ISSUED/);
  assert.match(contract, /PREPARER/);
  assert.match(contract, /APPROVER/);
  assert.match(contract, /ISSUER/);
  assert.match(contract, /SoD/);
});

test('P10.19 requires artifact binding and checksum integrity', () => {
  assert.match(contract, /opaque artifact ID/);
  assert.match(contract, /SHA-256 checksum of the final `\.docx` bytes/);
  assert.match(contract, /artifact ID binding/);
  assert.match(contract, /checksum mismatch.*fail closed/s);
});

test('P10.19 requires single-use secure handoff', () => {
  assert.match(contract, /ACTIVE → CONSUMED/);
  assert.match(contract, /ACTIVE → REVOKED/);
  assert.match(contract, /wrong actor/);
  assert.match(contract, /wrong scope/);
  assert.match(contract, /expired grant/);
  assert.match(contract, /replay/);
});

test('P10.19 forbids unsafe template/provider behavior', () => {
  assert.match(contract, /arbitrary filesystem paths/);
  assert.match(contract, /macro execution/);
  assert.match(contract, /provider\/network is not invoked before commit/);
  assert.match(contract, /No DDL/);
  assert.match(contract, /AI/);
});

test('P10.19 evidence remains synthetic and fail-closed', () => {
  assert.match(contract, /opaque synthetic identifiers/);
  assert.match(contract, /No detainee PII/);
  assert.match(contract, /SKIPPED_BY_SAFETY_GATE|BLOCKED/);
});
