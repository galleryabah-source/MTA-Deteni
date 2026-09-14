import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const contract = fs.readFileSync('docs/03-implementation/P10.15-CONTROLLED-DATABASE-EXECUTION-HARNESS.md', 'utf8');

test('P10.15 is fail-closed under migration freeze', () => {
  assert.match(contract, /MIGRATION_FREEZE=true/);
  assert.match(contract, /SKIPPED_BY_SAFETY_GATE/);
  assert.match(contract, /never PASS/i);
  assert.match(contract, /target database identity/i);
  assert.match(contract, /migration artifact SHA-256/i);
});

test('P10.15 forbids arbitrary execution inputs', () => {
  assert.match(contract, /MUST NOT accept client-provided SQL/i);
  assert.match(contract, /arbitrary connection strings/i);
  assert.match(contract, /No wildcard or fallback target is permitted/i);
});

test('P10.15 keeps sensitive data out of evidence', () => {
  assert.match(contract, /No detainee PII/i);
  assert.match(contract, /credentials, access tokens or provider secrets/i);
});
