const VALID_STATES = new Set(['ACTIVE', 'EXIT_REQUESTED', 'ESCORT_ASSIGNED', 'HANDOVER_RECORDED', 'DUTY_COMPLETED']);

export function validatePlacementCommand(input) {
  const required = ['detaineeId', 'targetBlockId', 'targetRoomId', 'actorId', 'scope', 'requestId', 'correlationId'];
  if (!required.every((key) => typeof input?.[key] === 'string' && input[key].trim())) throw new Error('PLACEMENT_CONTEXT_REQUIRED');
  if (input.sourceRoomId !== null && input.sourceRoomId !== undefined && typeof input.sourceRoomId !== 'string') throw new Error('PLACEMENT_SOURCE_INVALID');
  if (!VALID_STATES.has(input.detaineeState)) throw new Error('PLACEMENT_STATE_INVALID');
  if (input.detaineeState !== 'ACTIVE') throw new Error('PLACEMENT_STATE_NOT_ELIGIBLE');
  if (input.targetCapacityRemaining !== undefined && (!Number.isInteger(input.targetCapacityRemaining) || input.targetCapacityRemaining < 1)) throw new Error('PLACEMENT_CAPACITY_EXCEEDED');
  return Object.freeze({ operation: 'TRANSFER_PLACEMENT', detaineeId: input.detaineeId, sourceRoomId: input.sourceRoomId ?? null, targetBlockId: input.targetBlockId, targetRoomId: input.targetRoomId, actorId: input.actorId, scope: input.scope, requestId: input.requestId, correlationId: input.correlationId });
}

export function buildPlacementRecord(command) {
  return Object.freeze({ detaineeId: command.detaineeId, blockId: command.targetBlockId, roomId: command.targetRoomId, status: 'ACTIVE', requestId: command.requestId });
}
