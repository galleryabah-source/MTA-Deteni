import test from 'node:test';
import assert from 'node:assert/strict';
import { assertTemporaryExitCommandInput, createCommandFingerprint } from '../src/application/temporary-exit-command-contract.mjs';

test('P10.61 command requires server-bound mutation identity', () => {
  assert.throws(() => assertTemporaryExitCommandInput({ exitId: 'E', actorId: 'A', scopeId: 'S' }), /MISSING_COMMAND_FIELD:idempotencyKey/);
  assert.equal(assertTemporaryExitCommandInput({ exitId: 'E', actorId: 'A', scopeId: 'S', idempotencyKey: 'K' }), true);
});

test('P10.62 conflicting client identity is rejected', () => {
  assert.throws(() => assertTemporaryExitCommandInput({ exitId: 'E', actorId: 'A', scopeId: 'S', idempotencyKey: 'K', clientActorId: 'B' }), /CLIENT_ACTOR_ID_MISMATCH/);
  assert.throws(() => assertTemporaryExitCommandInput({ exitId: 'E', actorId: 'A', scopeId: 'S', idempotencyKey: 'K', clientScopeId: 'OTHER' }), /CLIENT_SCOPE_ID_MISMATCH/);
});

test('P10.63 fingerprint includes operation identity and scope context', () => {
  const a = createCommandFingerprint({ operation: 'RETURN', actorId: 'A', scopeId: 'S', resourceId: 'E', idempotencyKey: 'K', payload: { x: 1 } });
  const b = createCommandFingerprint({ operation: 'RETURN', actorId: 'A', scopeId: 'S', resourceId: 'E', idempotencyKey: 'K', payload: { x: 2 } });
  assert.notEqual(a, b);
});
