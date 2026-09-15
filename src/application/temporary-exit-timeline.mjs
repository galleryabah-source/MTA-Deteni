const TERMINAL_STEPS = new Set(['CLOSE']);

export function createTemporaryExitTimeline({ exitId, scopeId, correlationId, now = new Date().toISOString() }) {
  if (!exitId || !scopeId || !correlationId) throw new Error('exitId, scopeId and correlationId are required');
  return Object.freeze({ exitId, scopeId, correlationId, status: 'OPEN', version: 1, events: Object.freeze([]), createdAt: now, updatedAt: now });
}

export function appendTemporaryExitTimeline(timeline, { step, actorId, result = 'SUCCESS', occurredAt = new Date().toISOString(), metadata = {} }) {
  if (!timeline || typeof timeline !== 'object') throw new Error('timeline is required');
  if (!step || typeof step !== 'string') throw new Error('step is required');
  if (!actorId || typeof actorId !== 'string') throw new Error('actorId is required');
  if (timeline.status === 'CLOSED') throw new Error('Timeline is closed');
  const event = Object.freeze({ sequence: timeline.events.length + 1, step, actorId, result, occurredAt, metadata: Object.freeze({ ...metadata }) });
  const closed = TERMINAL_STEPS.has(step);
  return Object.freeze({ ...timeline, status: closed ? 'CLOSED' : 'OPEN', version: timeline.version + 1, events: Object.freeze([...timeline.events, event]), updatedAt: occurredAt });
}

export function getTemporaryExitTimeline(timeline) {
  return Object.freeze({ ...timeline, events: Object.freeze([...timeline.events]) });
}
