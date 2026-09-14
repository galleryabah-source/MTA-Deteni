import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const gate = fs.readFileSync('docs/03-implementation/P10.39-FINAL-PRE-GOVERNANCE-GATE.md', 'utf8');
const status = fs.readFileSync('PROJECT_STATUS.md', 'utf8');

test('P10.39 remains blocked for production and separates governance from activation', () => {
  assert.match(gate, /BLOCKED FOR PRODUCTION/);
  assert.match(gate, /READY FOR GOVERNANCE REVIEW/);
  assert.match(gate, /READY FOR PRODUCTION/);
  assert.match(gate, /cannot lift Migration Freeze/);
  assert.match(gate, /Super Admin cannot bypass operational authority/);
  assert.match(status, /Certification:\*\* NOT CERTIFIED/);
});
