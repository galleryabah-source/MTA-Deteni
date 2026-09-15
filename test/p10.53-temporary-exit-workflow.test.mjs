import test from 'node:test';
import assert from 'node:assert/strict';
import { executeSyntheticTemporaryExitWorkflow } from '../src/application/temporary-exit-workflow.mjs';

const base = {
  exitId: 'EXIT-SYN-53', scopeId: 'SCOPE-1', detaineeRef: 'DET-SYN-53', authorizationId: 'AUTH-SYN-53', objectId: 'OBJ-SYN-53',
  document: { documentId: 'DOC-SYN-53', kind: 'TEMPORARY_EXIT_PERMISSION', contractVersion: 'DOC-CONTRACT-1', templateId: 'TEMP-EXIT-SYN', templateVersion: '1.0.0', artifactId: 'ART-SYN-53', artifactSha256: 'b'.repeat(64) },
  actors: { preparerId: 'PREP-53', approverId: 'APP-53', issuerId: 'ISS-53' }, now: new Date('2026-09-15T00:00:00.000Z'),
};

test('P10.53 composes authorization, SoD document issuance and single-use handoff', () => {
  const result = executeSyntheticTemporaryExitWorkflow(base);
  assert.equal(result.document.state, 'ISSUED');
  assert.equal(result.handoff.status, 'ACTIVE');
  assert.deepEqual(result.completedSteps, ['REQUEST','VALIDATE','AUTHORIZE','GENERATE_EXIT_DOCUMENT','ASSIGN_ESCORT','APPROVE_DOCUMENT','ISSUE_DOCUMENT','GRANT_DOWNLOAD','DOWNLOAD']);
  assert.equal(result.timeline.events.length, result.completedSteps.length);
});

test('P10.53 keeps provider activation post-commit only', () => {
  const result = executeSyntheticTemporaryExitWorkflow(base);
  assert.equal(result.postCommitProvider('WHATSAPP_NOTIFY'), 'WHATSAPP_NOTIFY');
});
