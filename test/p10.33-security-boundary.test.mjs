import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const security = readFileSync('docs/03-implementation/P10.33-SECURITY-BOUNDARY-FINALIZATION.md', 'utf8');

test('P10.33 security invariants remain consolidated and fail-closed', () => {
  assert.equal((security.match(/^\d+\./gm) ?? []).length, 12);
  for (const term of ['Super Admin', 'SoD', 'AI remains assistive and OFF', 'Migration remains frozen', 'independently observable']) assert.match(security, new RegExp(term, 'i'));
});
