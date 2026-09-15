import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemporaryExitPlan, assertTemporaryExitStep, assertPostCommitProvider } from '../src/application/temporary-exit-vertical-slice.mjs';

test('P10.49 enforces the temporary-exit workflow order', () => {
  const plan = createTemporaryExitPlan({ requestId: 'REQ-1', detaineeId: 'DET-SYN-1', scopeId: 'SCOPE-1', correlationId: 'CORR-1' });
  assert.equal(plan.steps[0], 'REQUEST');
  assert.equal(plan.steps.at(-1), 'CLOSE');
  assert.throws(() => assertTemporaryExitStep(plan, 'ISSUE_DOCUMENT', ['REQUEST', 'VALIDATE']), /Prerequisite/);
  assert.doesNotThrow(() => assertTemporaryExitStep(plan, 'ISSUE_DOCUMENT', ['REQUEST', 'VALIDATE', 'AUTHORIZE', 'GENERATE_EXIT_DOCUMENT', 'ASSIGN_ESCORT', 'APPROVE_DOCUMENT']));
});

test('P10.49 blocks provider activation before commit', () => {
  assert.throws(() => assertPostCommitProvider('WHATSAPP_NOTIFY', { transactionCommitted: false }), /committed transaction/);
  assert.doesNotThrow(() => assertPostCommitProvider('WHATSAPP_NOTIFY', { transactionCommitted: true }));
});
