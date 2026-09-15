import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemporaryExitTimeline, appendTemporaryExitTimeline } from '../src/application/temporary-exit-timeline.mjs';

test('P10.52 preserves ordered, append-only temporary-exit timeline', () => {
  let timeline = createTemporaryExitTimeline({ exitId: 'EXIT-SYN-1', scopeId: 'SCOPE-1', correlationId: 'CORR-1' });
  timeline = appendTemporaryExitTimeline(timeline, { step: 'REQUEST', actorId: 'A' });
  timeline = appendTemporaryExitTimeline(timeline, { step: 'APPROVE_DOCUMENT', actorId: 'B' });
  assert.deepEqual(timeline.events.map((event) => event.sequence), [1, 2]);
  assert.equal(timeline.events[0].actorId, 'A');
  assert.equal(timeline.events[1].actorId, 'B');
});

test('P10.52 closes timeline at CLOSE and rejects later mutation', () => {
  let timeline = createTemporaryExitTimeline({ exitId: 'EXIT-SYN-2', scopeId: 'SCOPE-1', correlationId: 'CORR-2' });
  timeline = appendTemporaryExitTimeline(timeline, { step: 'CLOSE', actorId: 'C' });
  assert.equal(timeline.status, 'CLOSED');
  assert.throws(() => appendTemporaryExitTimeline(timeline, { step: 'RETURN', actorId: 'D' }), /Timeline is closed/);
});
