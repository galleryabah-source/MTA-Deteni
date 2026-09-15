import test from 'node:test';
import assert from 'node:assert/strict';
import { assertTemporaryExitRepository } from '../src/application/temporary-exit-repository-contract.mjs';

test('P10.57 accepts only repositories implementing the complete application contract', () => {
  const repository = Object.fromEntries(['getById','create','update','appendTimeline','saveDocument','saveArtifactGrant','transaction'].map((name) => [name, () => undefined]));
  assert.equal(assertTemporaryExitRepository(repository), repository);
});

test('P10.57 fails closed when a persistence capability is missing', () => {
  assert.throws(() => assertTemporaryExitRepository({ getById() {} }), /REPOSITORY_CONTRACT_MISSING:create/);
});
