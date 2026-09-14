import test from 'node:test';
import assert from 'node:assert/strict';
import { grantInsertParams, PERSISTENT_GRANT_CONTRACT, assertSingleRowTransition, GRANT_STATUS } from '../src/domain/persistent-artifact-grant.mjs';

test('P10.10 persistent grant insert contract is deterministic and active', () => {
  const grant = { grantId:'g1', documentId:'d1', artifactId:'a1', artifactSha256:'sha256', objectId:'o1', actorId:'u1', scopeId:'s1', issuedAt:'2026-09-14T12:00:00.000Z', expiresAt:'2026-09-14T12:01:00.000Z' };
  const params = grantInsertParams(grant);
  assert.equal(params.at(-1), GRANT_STATUS.ACTIVE);
  assert.equal(params.length, 10);
});

test('P10.10 consume transition is atomic and concurrency-safe by affected-row contract', () => {
  assert.match(PERSISTENT_GRANT_CONTRACT.consume.predicate, /status = 'ACTIVE'/);
  assert.match(PERSISTENT_GRANT_CONTRACT.consume.predicate, /expires_at > :now/);
  assert.equal(PERSISTENT_GRANT_CONTRACT.consume.expectedAffectedRows, 1);
  assert.doesNotThrow(() => assertSingleRowTransition(1));
  assert.throws(() => assertSingleRowTransition(0), /GRANT_TRANSITION_NOT_APPLIED/);
});

test('P10.10 revoke transition is actor/scope bound and active-only', () => {
  assert.match(PERSISTENT_GRANT_CONTRACT.revoke.predicate, /status = 'ACTIVE'/);
  assert.match(PERSISTENT_GRANT_CONTRACT.revoke.predicate, /actor_id = :actorId/);
  assert.match(PERSISTENT_GRANT_CONTRACT.revoke.predicate, /scope_id = :scopeId/);
  assert.equal(PERSISTENT_GRANT_CONTRACT.revoke.expectedAffectedRows, 1);
});
