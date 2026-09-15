import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemporaryExitOperationalState, transitionTemporaryExitOperationalState } from '../src/application/temporary-exit-operational-state.mjs';

test('P10.55 allows only the canonical operational sequence', () => {
  let current = createTemporaryExitOperationalState();
  for (const next of ['EXIT_REQUESTED','HANDOVER_RECORDED','RETURN_RECORDED','DUTY_COMPLETED','CLOSED']) current = transitionTemporaryExitOperationalState(current.state, next);
  assert.equal(current.state, 'CLOSED');
});

test('P10.55 rejects bypass, regression and post-close transitions', () => {
  assert.throws(() => transitionTemporaryExitOperationalState('READY','RETURN_RECORDED'), /INVALID_OPERATIONAL_TRANSITION/);
  assert.throws(() => transitionTemporaryExitOperationalState('HANDOVER_RECORDED','DUTY_COMPLETED'), /INVALID_OPERATIONAL_TRANSITION/);
  assert.throws(() => transitionTemporaryExitOperationalState('CLOSED','READY'), /INVALID_OPERATIONAL_TRANSITION/);
});
