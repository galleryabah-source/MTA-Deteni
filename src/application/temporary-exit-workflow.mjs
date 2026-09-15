import { createTemporaryExitPlan, assertTemporaryExitStep, assertPostCommitProvider } from './temporary-exit-vertical-slice.mjs';
import { createIssuanceWorkflow, prepareApproveIssueDocument } from './document-issuance-orchestrator.mjs';
import { createArtifactHandoff } from '../domain/artifact-handoff.mjs';
import { createTemporaryExitTimeline, appendTemporaryExitTimeline } from './temporary-exit-timeline.mjs';

export function executeSyntheticTemporaryExitWorkflow({ exitId, scopeId, detaineeRef, authorizationId, document, actors, objectId, now = new Date() }) {
  if (!exitId || !scopeId || !detaineeRef || !authorizationId || !document || !actors || !objectId) throw new Error('Complete temporary-exit workflow input is required');
  const workflow = createIssuanceWorkflow(actors);
  const plan = createTemporaryExitPlan({ exitId, detaineeId: detaineeRef, scope: scopeId });
  let timeline = createTemporaryExitTimeline({ exitId, scopeId, correlationId: plan.correlationId, now: new Date(now).toISOString() });
  const add = (step, actorId, metadata = {}) => {
    assertTemporaryExitStep(plan, step);
    timeline = appendTemporaryExitTimeline(timeline, { step, actorId, metadata, occurredAt: new Date(now).toISOString() });
  };

  add('REQUEST', actors.preparerId);
  add('VALIDATE', actors.preparerId);
  add('AUTHORIZE', actors.approverId, { authorizationId });
  add('GENERATE_EXIT_DOCUMENT', actors.preparerId);
  add('ASSIGN_ESCORT', actors.approverId);

  const issuedDocument = prepareApproveIssueDocument({ workflow, recordInput: { ...document, subjectRef: detaineeRef, authorizationId, scopeId, correlationId: plan.correlationId }, now: new Date(now).toISOString() });
  add('APPROVE_DOCUMENT', actors.approverId, { documentId: issuedDocument.documentId });
  add('ISSUE_DOCUMENT', actors.issuerId, { documentId: issuedDocument.documentId, artifactId: issuedDocument.artifactId });

  const handoff = createArtifactHandoff({ document: issuedDocument, objectId, actorId: actors.issuerId, scopeId, now });
  add('GRANT_DOWNLOAD', actors.issuerId, { grantId: handoff.grantId });
  add('DOWNLOAD', actors.issuerId, { grantId: handoff.grantId });

  return Object.freeze({ plan, timeline, document: issuedDocument, handoff, postCommitProvider: (providerStep) => { assertPostCommitProvider({ transactionCommitted: true, providerStep }); return providerStep; } });
}
