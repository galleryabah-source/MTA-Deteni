import { createDocumentRecord, transitionDocument, assertIssueEligible, DOCUMENT_STATES } from '../domain/document-lifecycle.mjs';

function requiredActor(actor, name) {
  if (typeof actor !== 'string' || actor.trim() === '') throw new Error(`${name} is required`);
  return actor.trim();
}

export function createIssuanceWorkflow({ preparerId, approverId, issuerId }) {
  const preparer = requiredActor(preparerId, 'preparerId');
  const approver = requiredActor(approverId, 'approverId');
  const issuer = requiredActor(issuerId, 'issuerId');
  if (new Set([preparer, approver, issuer]).size !== 3) throw new Error('Separation of duties requires distinct preparer, approver and issuer');
  return Object.freeze({ preparerId: preparer, approverId: approver, issuerId: issuer });
}

export function prepareApproveIssueDocument({ workflow, recordInput, now = new Date().toISOString() }) {
  if (!workflow) throw new Error('issuance workflow is required');
  let record = createDocumentRecord({ ...recordInput, now });
  record = transitionDocument(record, { to: DOCUMENT_STATES.PENDING_APPROVAL, actor: workflow.preparerId, role: 'PREPARER', now });
  record = transitionDocument(record, { to: DOCUMENT_STATES.APPROVED, actor: workflow.approverId, role: 'APPROVER', now });
  assertIssueEligible(record);
  record = transitionDocument(record, { to: DOCUMENT_STATES.ISSUED, actor: workflow.issuerId, role: 'ISSUER', now });
  return record;
}
