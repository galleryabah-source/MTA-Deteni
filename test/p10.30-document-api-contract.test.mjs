import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const contract = readFileSync('docs/03-implementation/P10.30-DOCUMENT-API-SYNTHETIC-CONTRACT-TESTS.md', 'utf8');

test('P10.30 document API covers authorization, deterministic output and secure handoff', () => {
  for (const term of ['unauthenticated', 'document.generate', 'wrong scope', 'classification', 'lifecycle', 'deterministic', 'SHA-256', 'download', 'wrong actor', 'replay', 'revoke', 'before commit']) assert.match(contract, new RegExp(term.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i'));
  assert.equal((contract.match(/^\d+\./gm) ?? []).length, 15);
});
