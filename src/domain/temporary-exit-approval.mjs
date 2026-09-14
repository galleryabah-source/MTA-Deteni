const PURPOSES = new Set(['MEDICAL','LEGAL','ADMINISTRATIVE','OTHER']);
const STATES = new Set(['EXIT_REQUESTED','ESCORT_ASSIGNED','HANDOVER_RECORDED','DUTY_COMPLETED']);

export function validateTemporaryExitApproval(input) {
  const required = ['detaineeId','actorId','scope','requestId','correlationId','purpose'];
  if (!required.every((k) => typeof input?.[k] === 'string' && input[k].trim())) throw new Error('EXIT_APPROVAL_CONTEXT_REQUIRED');
  if (!PURPOSES.has(input.purpose)) throw new Error('EXIT_PURPOSE_INVALID');
  if (!STATES.has(input.currentState)) throw new Error('EXIT_STATE_INVALID');
  if (input.currentState !== 'EXIT_REQUESTED') throw new Error('EXIT_APPROVAL_STATE_NOT_ELIGIBLE');
  if (typeof input.approverId !== 'string' || !input.approverId.trim()) throw new Error('EXIT_APPROVER_REQUIRED');
  if (input.approverId === input.actorId) throw new Error('EXIT_SEPARATION_OF_DUTIES');
  return Object.freeze({ detaineeId: input.detaineeId, actorId: input.actorId, approverId: input.approverId, scope: input.scope, requestId: input.requestId, correlationId: input.correlationId, purpose: input.purpose, decision: 'APPROVED' });
}

export function buildTemporaryExitApprovalRecord(input) {
  return Object.freeze({ ...validateTemporaryExitApproval(input), eventType: 'TEMPORARY_EXIT_APPROVED', provenance: 'SYSTEM_COMMAND', immutable: true });
}
