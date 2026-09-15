import test from 'node:test';
import assert from 'node:assert/strict';
import { createUnifiedTemporaryExitService } from '../src/application/unified-temporary-exit-service.mjs';
import { createTemporaryExitPlan } from '../src/application/temporary-exit-vertical-slice.mjs';
import { createTemporaryExitTimeline, appendTemporaryExitTimeline } from '../src/application/temporary-exit-timeline.mjs';

function repository(initial = []) {
  const store = new Map(initial);
  return {
    getById: (id) => store.get(id),
    create: (id, value) => { store.set(id, value); },
    update: (id, value) => { store.set(id, value); },
    appendTimeline: () => undefined,
    saveDocument: () => undefined,
    saveArtifactGrant: () => undefined,
    transaction: (fn) => fn(),
  };
}

function preparedRecord() {
  const plan = createTemporaryExitPlan({ requestId: 'REQ-58', detaineeId: 'DET-58', scopeId: 'SCOPE-1', correlationId: 'CORR-58' });
  let timeline = createTemporaryExitTimeline({ exitId: 'EXIT-58', scopeId: 'SCOPE-1', correlationId: 'CORR-58' });
  for (const step of ['REQUEST','VALIDATE','AUTHORIZE','GENERATE_EXIT_DOCUMENT','ASSIGN_ESCORT','APPROVE_DOCUMENT','ISSUE_DOCUMENT','GRANT_DOWNLOAD','DOWNLOAD']) timeline = appendTemporaryExitTimeline(timeline, { step, actorId: 'ACTOR-1' });
  return { plan, timeline, operationalState: 'EXIT_REQUESTED' };
}

test('P10.58 unified service completes the operational continuation after pre-exit workflow', () => {
  const service = createUnifiedTemporaryExitService({ repository: repository([['EXIT-58', preparedRecord()]]) });
  const input = { exitId: 'EXIT-58', requestId: 'REQ-58', detaineeId: 'DET-58', scopeId: 'SCOPE-1', actorId: 'ACTOR-1' };
  assert.equal(service.executeExit(input).operationalState, 'HANDOVER_RECORDED');
  assert.equal(service.recordReturn(input).operationalState, 'RETURN_RECORDED');
  assert.equal(service.completeDuty(input).operationalState, 'DUTY_COMPLETED');
  assert.equal(service.close(input).operationalState, 'CLOSED');
});

test('P10.58 request and execution boundaries fail closed when prerequisites are absent', () => {
  const service = createUnifiedTemporaryExitService({ repository: repository() });
  const input = { exitId: 'EXIT-58B', requestId: 'REQ-58B', detaineeId: 'DET-58B', scopeId: 'SCOPE-1', actorId: 'ACTOR-1' };
  service.request(input);
  assert.throws(() => service.executeExit(input), /Prerequisite step not completed: VALIDATE/);
});
