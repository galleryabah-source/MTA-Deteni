import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTemporaryExitApproval } from '../src/domain/temporary-exit-approval.mjs';
import { executeTemporaryExitApproval } from '../src/application/temporary-exit-approval-command.mjs';
import { TransactionalKernelStore } from '../src/kernel/transactional-command.mjs';

const auth = { authenticated: true, allowedScopes: ['RUDENIM'], assignedDuties: ['KAMTIB'], classification: 'RESTRICTED', resourceExists: true, stateValid: true, policyAllowed: true };
const base = { detaineeId:'SYN-DETAIN-001', actorId:'officer-01', approverId:'approver-02', scope:'RUDENIM', requestId:'req-105-001', correlationId:'corr-105-001', purpose:'MEDICAL', currentState:'EXIT_REQUESTED' };

test('P10.5-001 valid approval enforces separation of duties', () => assert.equal(validateTemporaryExitApproval(base).decision, 'APPROVED'));
test('P10.5-002 self approval rejected', () => assert.throws(() => validateTemporaryExitApproval({...base, approverId:base.actorId}), /EXIT_SEPARATION_OF_DUTIES/));
test('P10.5-003 approval requires EXIT_REQUESTED', () => assert.throws(() => validateTemporaryExitApproval({...base, currentState:'ACTIVE'}), /EXIT_APPROVAL_STATE_NOT_ELIGIBLE/));
test('P10.5-004 authorization denial creates no side effects', () => {
  const store = new TransactionalKernelStore();
  const result = executeTemporaryExitApproval({ authContext:{...auth, policyAllowed:false}, ...base, idempotencyKey:'idem-105-004', store });
  assert.equal(result.status, 'DENIED');
  assert.deepEqual(store.snapshot(), { domain:{}, auditCount:0, outbox:[], idempotencyCount:0 });
});
test('P10.5-005 successful approval commits audit and outbox atomically', () => {
  const store = new TransactionalKernelStore();
  const result = executeTemporaryExitApproval({ authContext:auth, ...base, idempotencyKey:'idem-105-005', store });
  assert.equal(result.status, 'COMMITTED');
  const snapshot = store.snapshot();
  assert.equal(snapshot.domain['SYN-DETAIN-001'].state, 'EXIT_APPROVED');
  assert.equal(snapshot.auditCount, 1);
  assert.equal(snapshot.outbox.length, 1);
});
test('P10.5-006 replay does not duplicate approval side effects', () => {
  const store = new TransactionalKernelStore();
  const first = executeTemporaryExitApproval({ authContext:auth, ...base, idempotencyKey:'idem-105-006', store });
  const replay = executeTemporaryExitApproval({ authContext:auth, ...base, idempotencyKey:'idem-105-006', store });
  assert.equal(first.status, 'COMMITTED');
  assert.equal(replay.status, 'REPLAY');
  assert.equal(store.snapshot().auditCount, 1);
  assert.equal(store.snapshot().outbox.length, 1);
});
test('P10.5-007 different request payload cannot reuse idempotency key', () => {
  const store = new TransactionalKernelStore();
  executeTemporaryExitApproval({ authContext:auth, ...base, idempotencyKey:'idem-105-007', store });
  const conflict = executeTemporaryExitApproval({ authContext:auth, ...base, purpose:'LEGAL', idempotencyKey:'idem-105-007', store });
  assert.equal(conflict.status, 'CONFLICT');
});
