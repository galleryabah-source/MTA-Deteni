const TRANSITIONS = Object.freeze({
  ACTIVE: 'EXIT_REQUESTED',
  EXIT_REQUESTED: 'ESCORT_ASSIGNED',
  ESCORT_ASSIGNED: 'HANDOVER_RECORDED',
  HANDOVER_RECORDED: 'DUTY_COMPLETED',
});

export function assertTransition(from, to) {
  if (TRANSITIONS[from] !== to) throw new Error('INVALID_DOMAIN_TRANSITION');
  return Object.freeze({ from, to });
}

export function createSyntheticLeaveCommand({ detaineeId, actorId, scope, requestId, correlationId }) {
  if (![detaineeId, actorId, scope, requestId, correlationId].every((v) => typeof v === 'string' && v.trim())) throw new Error('COMMAND_CONTEXT_REQUIRED');
  return Object.freeze({ operation: 'CREATE_TEMPORARY_EXIT', detaineeId, actorId, scope, requestId, correlationId });
}
