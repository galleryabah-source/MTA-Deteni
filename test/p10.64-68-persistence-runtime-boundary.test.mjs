import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemporaryExitTimeline, appendTemporaryExitTimeline } from '../src/application/temporary-exit-timeline.mjs';
import { createTemporaryExitOperationalState, transitionTemporaryExitOperationalState } from '../src/application/temporary-exit-operational-state.mjs';
import { assertPostCommitProvider } from '../src/application/temporary-exit-vertical-slice.mjs';
import { assertTemporaryExitRepository, TEMPORARY_EXIT_REPOSITORY_CONTRACT } from '../src/application/temporary-exit-repository-contract.mjs';

test('P10.64 operational workflow remains distinct from detainee lifecycle', () => {
  const operational = createTemporaryExitOperationalState();
  assert.equal(operational, 'READY');
  assert.equal(transitionTemporaryExitOperationalState(operational, 'REQUEST'), 'EXIT_REQUESTED');
  assert.throws(() => transitionTemporaryExitOperationalState('READY', 'EXECUTE_EXIT'), /Invalid operational transition/);
  assert.equal(typeof operational, 'string');
});

test('P10.65 timeline is append-only and terminal close blocks mutation', () => {
  let timeline = createTemporaryExitTimeline({ exitId: 'E', scopeId: 'S', correlationId: 'C' });
  timeline = appendTemporaryExitTimeline(timeline, { step: 'REQUEST', actorId: 'A' });
  timeline = appendTemporaryExitTimeline(timeline, { step: 'CLOSE', actorId: 'B' });
  assert.equal(timeline.status, 'CLOSED');
  assert.equal(timeline.events.length, 2);
  assert.throws(() => appendTemporaryExitTimeline(timeline, { step: 'RETURN', actorId: 'B' }), /Timeline is closed/);
});

test('P10.66 provider boundary requires committed transaction', () => {
  assert.throws(() => assertPostCommitProvider('WHATSAPP_NOTIFY', { transactionCommitted: false }), /committed transaction/);
  assert.equal(assertPostCommitProvider('WHATSAPP_NOTIFY', { transactionCommitted: true }), true);
});

test('P10.67 artifact/download boundary remains post-issuance', () => {
  assert.throws(() => assertPostCommitProvider('STORAGE_PUBLISH', { transactionCommitted: false }), /committed transaction/);
});

test('P10.68 runtime persistence is adapter-bound and contract-validated', () => {
  const repository = Object.fromEntries(TEMPORARY_EXIT_REPOSITORY_CONTRACT.map((method) => [method, () => undefined]));
  assert.equal(assertTemporaryExitRepository(repository), repository);
  assert.throws(() => assertTemporaryExitRepository({ ...repository, transaction: undefined }), /REPOSITORY_CONTRACT_MISSING:transaction/);
});
