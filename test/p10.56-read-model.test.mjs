import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemporaryExitPlan } from '../src/application/temporary-exit-vertical-slice.mjs';
import { createTemporaryExitTimeline } from '../src/application/temporary-exit-timeline.mjs';
import { buildTemporaryExitReadModel } from '../src/application/temporary-exit-read-model.mjs';

test('P10.56 exposes one operational read model without mutating source state', () => {
  const plan = createTemporaryExitPlan({ requestId: 'REQ-56', detaineeId: 'DET-56', scopeId: 'SCOPE-1', correlationId: 'CORR-56' });
  const timeline = createTemporaryExitTimeline({ exitId: 'EXIT-56', scopeId: 'SCOPE-1', correlationId: 'CORR-56' });
  const model = buildTemporaryExitReadModel({ plan, timeline, operationalState: 'READY' });
  assert.deepEqual(Object.keys(model), ['requestId','detaineeId','scopeId','correlationId','operationalState','document','handoff','timeline','timelineStatus']);
  assert.equal(model.operationalState, 'READY');
  assert.equal(model.timeline.length, 0);
});
