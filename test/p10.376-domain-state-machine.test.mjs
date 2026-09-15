import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, transition } from '../src/domain/temporary-exit/state-machine.mjs';

test('temporary exit accepts the complete approved path', () => {
  const path = [
    'REQUESTED', 'VALIDATED', 'APPROVED', 'DOCUMENTED',
    'ESCORT_ASSIGNED', 'DEPARTED', 'RETURN_PENDING', 'RETURNED', 'COMPLETED',
  ];
  for (let i = 0; i < path.length - 1; i += 1) {
    assert.equal(canTransition(path[i], path[i + 1]), true);
    assert.deepEqual(transition(path[i], path[i + 1]), { ok: true, state: path[i + 1] });
  }
});

test('temporary exit rejects bypass and reverse transitions', () => {
  assert.equal(canTransition('REQUESTED', 'APPROVED'), false);
  assert.equal(canTransition('RETURNED', 'DEPARTED'), false);
  assert.deepEqual(transition('REQUESTED', 'COMPLETED'), {
    ok: false, code: 'INVALID_STATE', from: 'REQUESTED', to: 'COMPLETED',
  });
});

test('completed state is terminal', () => {
  assert.equal(canTransition('COMPLETED', 'REQUESTED'), false);
  assert.equal(canTransition('COMPLETED', 'COMPLETED'), false);
});
