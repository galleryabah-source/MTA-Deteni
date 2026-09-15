export function buildTemporaryExitReadModel({ plan, timeline, document = null, handoff = null, operationalState = 'READY' }) {
  if (!plan?.requestId || !plan?.detaineeId || !plan?.scopeId) throw new Error('Incomplete temporary-exit plan');
  if (!timeline || timeline.exitId == null) throw new Error('Temporary-exit timeline is required');
  return Object.freeze({
    requestId: plan.requestId,
    detaineeId: plan.detaineeId,
    scopeId: plan.scopeId,
    correlationId: plan.correlationId,
    operationalState,
    document: document ? Object.freeze({ documentId: document.documentId, artifactId: document.artifactId, status: document.status }) : null,
    handoff: handoff ? Object.freeze({ grantId: handoff.grantId, consumed: handoff.consumed === true, objectId: handoff.objectId }) : null,
    timeline: Object.freeze(timeline.events.map((event) => Object.freeze({ ...event }))),
    timelineStatus: timeline.status,
  });
}
