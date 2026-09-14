import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const doc = readFileSync('docs/03-implementation/P10.34-SECURITY-CERTIFICATION-READINESS.md', 'utf8');

test('P10.34 certification remains fail-closed', () => {
  assert.match(doc, /Status: NOT CERTIFIED/);
  assert.match(doc, /No evidence = not PASS/);
  assert.match(doc, /Migration Freeze/);
  assert.match(doc, /AI-OFF/);
  for (const term of ['authentication', 'authorization', 'audit', 'PostgreSQL', 'RLS', 'private storage', 'provider', 'HTTP enforcement']) assert.match(doc, new RegExp(term, 'i'));
});
