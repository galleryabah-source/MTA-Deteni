import test from 'node:test';
import assert from 'node:assert/strict';
import { createUnifiedTemporaryExitService } from '../src/application/unified-temporary-exit-service.mjs';

function transactionalRepository() {
  const store = new Map();
  return {
    getById: (id) => store.get(id),
    create: (id, value) => { store.set(id, value); },
    update: (id, value) => { store.set(id, value); },
    appendTimeline() {}, saveDocument() {}, saveArtifactGrant() {},
    transaction(fn) {
      const snapshot = new Map(store);
      try { return fn(); } catch (error) { store.clear(); for (const [k, v] of snapshot) store.set(k, v); throw error; }
    },
  };
}

test('P10.59 failed command leaves repository state unchanged', () => {
  const repository = transactionalRepository();
  const service = createUnifiedTemporaryExitService({ repository });
  const input = { exitId: 'EXIT-59', requestId: 'REQ-59', detaineeId: 'DET-59', scopeId: 'SCOPE-1', actorId: 'ACTOR-1' };
  service.request(input);
  const before = service.read(input).operationalState;
  assert.throws(() => service.recordReturn(input), /INVALID_OPERATIONAL_STATE/);
  assert.equal(service.read(input).operationalState, before);
});
