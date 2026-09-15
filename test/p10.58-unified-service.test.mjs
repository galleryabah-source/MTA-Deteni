import test from 'node:test';
import assert from 'node:assert/strict';
import { createUnifiedTemporaryExitService } from '../src/application/unified-temporary-exit-service.mjs';

function repository() {
  const store = new Map();
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

test('P10.58 unified service composes request, exit, return, duty and close', () => {
  const service = createUnifiedTemporaryExitService({ repository: repository() });
  const input = { exitId: 'EXIT-58', requestId: 'REQ-58', detaineeId: 'DET-58', scopeId: 'SCOPE-1', actorId: 'ACTOR-1' };
  assert.equal(service.request(input).operationalState, 'EXIT_REQUESTED');
  assert.equal(service.executeExit(input).operationalState, 'HANDOVER_RECORDED');
  assert.equal(service.recordReturn(input).operationalState, 'RETURN_RECORDED');
  assert.equal(service.completeDuty(input).operationalState, 'DUTY_COMPLETED');
  assert.equal(service.close(input).operationalState, 'CLOSED');
});

test('P10.58 rejects out-of-order commands', () => {
  const service = createUnifiedTemporaryExitService({ repository: repository() });
  const input = { exitId: 'EXIT-58B', requestId: 'REQ-58B', detaineeId: 'DET-58B', scopeId: 'SCOPE-1', actorId: 'ACTOR-1' };
  service.request(input);
  assert.throws(() => service.recordReturn(input), /INVALID_OPERATIONAL_STATE/);
});
