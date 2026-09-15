import test from 'node:test';
import assert from 'node:assert/strict';
import { createIssuanceWorkflow, prepareApproveIssueDocument } from '../src/application/document-issuance-orchestrator.mjs';

test('P10.51 requires distinct preparer approver and issuer', () => {
  assert.throws(() => createIssuanceWorkflow({ preparerId: 'A', approverId: 'A', issuerId: 'C' }), /Separation of duties/);
  assert.doesNotThrow(() => createIssuanceWorkflow({ preparerId: 'A', approverId: 'B', issuerId: 'C' }));
});

test('P10.51 issues only after approval and verified artifact binding', () => {
  const workflow = createIssuanceWorkflow({ preparerId: 'A', approverId: 'B', issuerId: 'C' });
  const record = prepareApproveIssueDocument({
    workflow,
    recordInput: {
      documentId: 'DOC-SYN-1', kind: 'TEMPORARY_EXIT_PERMISSION', subjectRef: 'DET-SYN-1', authorizationId: 'AUTH-SYN-1',
      contractVersion: 'DOC-CONTRACT-1', templateId: 'TEMP-EXIT-SYN', templateVersion: '1.0.0', artifactId: 'ART-SYN-1',
      artifactSha256: 'a'.repeat(64), scopeId: 'SCOPE-1', correlationId: 'CORR-1',
    },
  });
  assert.equal(record.state, 'ISSUED');
  assert.equal(record.lastTransition.role, 'ISSUER');
});
