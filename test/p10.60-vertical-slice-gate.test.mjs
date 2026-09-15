import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPORARY_EXIT_WORKFLOW_STEPS } from '../src/application/temporary-exit-vertical-slice.mjs';
import { createUnifiedTemporaryExitService } from '../src/application/unified-temporary-exit-service.mjs';

function repo() { const store = new Map(); return { getById: id => store.get(id), create: (id,v) => store.set(id,v), update: (id,v) => store.set(id,v), appendTimeline(){}, saveDocument(){}, saveArtifactGrant(){}, transaction: fn => fn() }; }

test('P10.60 preserves the canonical request-to-close workflow boundary', () => {
  assert.deepEqual(TEMPORARY_EXIT_WORKFLOW_STEPS, ['REQUEST','VALIDATE','AUTHORIZE','GENERATE_EXIT_DOCUMENT','ASSIGN_ESCORT','APPROVE_DOCUMENT','ISSUE_DOCUMENT','GRANT_DOWNLOAD','DOWNLOAD','EXECUTE_EXIT','RETURN','CLOSE']);
  const service = createUnifiedTemporaryExitService({ repository: repo() });
  const input = { exitId: 'EXIT-60', requestId: 'REQ-60', detaineeId: 'DET-60', scopeId: 'SCOPE-1', actorId: 'ACTOR-1' };
  service.request(input);
  const model = service.read(input);
  assert.equal(model.scopeId, 'SCOPE-1');
  assert.equal(model.detaineeId, 'DET-60');
  assert.equal(model.operationalState, 'EXIT_REQUESTED');
});
