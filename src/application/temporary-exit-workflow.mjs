import { createTemporaryExitPlan, assertTemporaryExitStep, assertPostCommitProvider } from './temporary-exit-vertical-slice.mjs';
import { createIssuanceWorkflow, prepareApproveIssueDocument } from './document-issuance-orchestrator.mjs';
import { createArtifactHandoff } from '../domain/artifact-handoff.mjs';
import { createTemporaryExitTimeline, appendTemporaryExitTimeline } from './temporary-exit-timeline.mjs';

export function executeSyntheticTemporaryExitWorkflow({ exitId, requestId = exitId, scopeId, detaineeRef, authorizationId, document, actors, objectId, correlationId = `CORR-${exitId}`, now = new Date() }) {
  if (!exitId || !scopeId || !detaineeRef || !authorizationId || !document || !actors || !objectId) throw new Error('Complete temporary-exit workflow input is required');
  const workflow = createIssuanceWorkflow(actors);
  const plan = createTemporaryExitPlan({ requestId, detaineeId: detaineeRef, scopeId, correlationId });
  let timeline = createTemporaryExitTimeline({ exitId, scopeId, correlationId, now: new Date(now).toISOString() });
  const completedSteps = [];
  const add = (step, actorId, metadata = {}) => {
    assertTemporaryExitStep(plan, step, completedSteps);
    timeline = appendTemporaryExitTimeline(timeline, { step, actorId, metadata, occurredAt: new Date(now).toISOString() });
    completedSteps.push(step);
  };

  add('REQUEST', actors.preparerId);
  add('VALIDATE', actors.preparerId);
  add('AUTHORIZE', actors.approverId, { authorizationId });
  add('GENERATE_EXIT_DOCUMENT', actors.preparerId);
  add('ASSIGN_ESCORT', actors.approverId);

  const issuedDocument = prepareApproveIssueDocument({ workflow, recordInput: { ...document, subjectRef: detaineeRef, authorizationId, scopeId, correlationId }, now: new Date(now).toISOString() });
  add('APPROVE_DOCUMENT', actors.approverId, { documentId: issuedDocument.documentId });
  add('ISSUE_DOCUMENT', actors.issuerId, { documentId: issuedDocument.documentId, artifactId: issuedDocument.artifactId });

  const handoff = createArtifactHandoff({ document: issuedDocument, objectId, actorId: actors.issuerId, scopeId, now });
  add('GRANT_DOWNLOAD', actors.issuerId, { grantId: handoff.grantId });
  add('DOWNLOAD', actors.issuerId, { grantId: handoff.grantId });

  return Object.freeze({ plan, timeline, document: issuedDocument, handoff, completedSteps: Object.freeze([...completedSteps]), postCommitProvider: (providerStep) => { assertPostCommitProvider(providerStep, { transactionCommitted: true }); return providerStep; } });
}
