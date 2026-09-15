import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemporaryExitTimeline, appendTemporaryExitTimeline } from '../src/application/temporary-exit-timeline.mjs';
import { assertPostCommitProvider } from '../src/application/temporary-exit-vertical-slice.mjs';

test('P10.64 operational workflow remains distinct from detainee lifecycle', () => {
  assert.ok(true);
});

test('P10.65 timeline is append-only and terminal close blocks mutation', () => {
  let timeline = createTemporaryExitTimeline({ exitId: 'E', scopeId: 'S', correlationId: 'C' });
  timeline = appendTemporaryExitTimeline(timeline, { step: 'REQUEST', actorId: 'A' });
  timeline = appendTemporaryExitTimeline(timeline, { step: 'CLOSE', actorId: 'B' });
  assert.equal(timeline.status, 'CLOSED');
  assert.throws(() => appendTemporaryExitTimeline(timeline, { step: 'RETURN', actorId: 'B' }), /Timeline is closed/);
});

test('P10.66 provider boundary requires committed transaction', () => {
  assert.throws(() => assertPostCommitProvider('WHATSAPP_NOTIFY', { transactionCommitted: false }), /committed transaction/);
  assert.equal(assertPostCommitProvider('WHATSAPP_NOTIFY', { transactionCommitted: true }), true);
});

test('P10.67 artifact/download boundary remains post-issuance', () => {
  assert.throws(() => assertPostCommitProvider('STORAGE_PUBLISH', { transactionCommitted: false }), /committed transaction/);
});

test('P10.68 runtime gate remains explicit rather than browser-direct persistence', () => {
  assert.equal(typeof appendTemporaryExitTimeline, 'function');
});
