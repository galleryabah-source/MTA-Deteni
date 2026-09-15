import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemporaryExitPlan } from '../src/application/temporary-exit-vertical-slice.mjs';
import { createTemporaryExitTimeline, appendTemporaryExitTimeline } from '../src/application/temporary-exit-timeline.mjs';
import { executeTemporaryExitOperationalStep } from '../src/application/temporary-exit-execution.mjs';

test('P10.54 enforces execute-exit and return state transitions in order', () => {
  const plan = createTemporaryExitPlan({ requestId: 'REQ-54', detaineeId: 'DET-54', scopeId: 'SCOPE-1', correlationId: 'CORR-54' });
  let timeline = createTemporaryExitTimeline({ exitId: 'EXIT-54', scopeId: 'SCOPE-1', correlationId: 'CORR-54' });
  for (const [step, actorId] of [['REQUEST','A'],['VALIDATE','A'],['AUTHORIZE','B'],['GENERATE_EXIT_DOCUMENT','A'],['ASSIGN_ESCORT','B'],['APPROVE_DOCUMENT','B'],['ISSUE_DOCUMENT','C'],['GRANT_DOWNLOAD','C'],['DOWNLOAD','C']]) {
    timeline = appendTemporaryExitTimeline(timeline, { step, actorId });
  }
  const executed = executeTemporaryExitOperationalStep({ plan, timeline, detaineeState: 'ESCORT_ASSIGNED', step: 'EXECUTE_EXIT', actorId: 'C' });
  assert.equal(executed.state, 'HANDOVER_RECORDED');
  const returned = executeTemporaryExitOperationalStep({ plan, timeline: executed.timeline, detaineeState: executed.state, step: 'RETURN', actorId: 'D' });
  assert.equal(returned.state, 'DUTY_COMPLETED');
  const closed = executeTemporaryExitOperationalStep({ plan, timeline: returned.timeline, detaineeState: returned.state, step: 'CLOSE', actorId: 'B' });
  assert.equal(closed.timeline.status, 'CLOSED');
});

test('P10.54 rejects operational state bypass', () => {
  const plan = createTemporaryExitPlan({ requestId: 'REQ-54B', detaineeId: 'DET-54B', scopeId: 'SCOPE-1', correlationId: 'CORR-54B' });
  const timeline = createTemporaryExitTimeline({ exitId: 'EXIT-54B', scopeId: 'SCOPE-1', correlationId: 'CORR-54B' });
  assert.throws(() => executeTemporaryExitOperationalStep({ plan, timeline, detaineeState: 'ACTIVE', step: 'RETURN', actorId: 'D' }), /INVALID_OPERATIONAL_STATE/);
});
