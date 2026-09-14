import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const contract = fs.readFileSync('docs/03-implementation/P10.16-DATABASE-ROLE-RLS-VERIFICATION-SPECIFICATION.md', 'utf8');

test('P10.16 keeps public and unauthorised contexts denied', () => {
  assert.match(contract, /anonymous\/public.*DENY/s);
  assert.match(contract, /wrong scope.*DENY/s);
  assert.match(contract, /inactive\/revoked actor.*DENY/s);
  assert.match(contract, /Super Admin without operational authority.*DENY/s);
});

test('P10.16 requires synthetic opaque fixtures', () => {
  assert.match(contract, /opaque IDs only/i);
  assert.match(contract, /never contain detainee names/i);
});

test('P10.16 is fail-closed', () => {
  assert.match(contract, /SKIPPED_BY_SAFETY_GATE/);
  assert.match(contract, /RLS is disabled/);
  assert.match(contract, /unexpected privileges exist/);
});
