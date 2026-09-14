const VALID_STATES = new Set(['ACTIVE', 'EXIT_REQUESTED', 'ESCORT_ASSIGNED', 'HANDOVER_RECORDED', 'DUTY_COMPLETED']);

export function validateMovementEvent(input) {
  const required = ['detaineeId', 'actorId', 'scope', 'requestId', 'correlationId'];
  if (!required.every((key) => typeof input?.[key] === 'string' && input[key].trim())) {
    throw new Error('MOVEMENT_CONTEXT_REQUIRED');
  }
  if (!VALID_STATES.has(input.detaineeState)) throw new Error('MOVEMENT_STATE_INVALID');
  if (input.detaineeState !== 'ACTIVE') throw new Error('MOVEMENT_STATE_NOT_ELIGIBLE');
  if (typeof input.toBlockId !== 'string' || !input.toBlockId.trim()) throw new Error('MOVEMENT_TARGET_BLOCK_REQUIRED');
  if (typeof input.toRoomId !== 'string' || !input.toRoomId.trim()) throw new Error('MOVEMENT_TARGET_ROOM_REQUIRED');
  if (input.fromRoomId !== null && input.fromRoomId !== undefined && typeof input.fromRoomId !== 'string') throw new Error('MOVEMENT_SOURCE_INVALID');
  return Object.freeze({
    eventType: 'PLACEMENT_TRANSFERRED',
    detaineeId: input.detaineeId,
    fromRoomId: input.fromRoomId ?? null,
    fromBlockId: input.fromBlockId ?? null,
    toBlockId: input.toBlockId,
    toRoomId: input.toRoomId,
    actorId: input.actorId,
    scope: input.scope,
    requestId: input.requestId,
    correlationId: input.correlationId,
    provenance: 'SYSTEM_COMMAND',
    immutable: true,
  });
}

export function appendMovementEvent(ledger, input) {
  if (!Array.isArray(ledger)) throw new Error('MOVEMENT_LEDGER_INVALID');
  const event = validateMovementEvent(input);
  if (ledger.some((item) => item.requestId === event.requestId)) return Object.freeze({ status: 'REPLAY', event: ledger.find((item) => item.requestId === event.requestId), ledger });
  const sequence = ledger.length + 1;
  const stored = Object.freeze({ ...event, sequence });
  return Object.freeze({ status: 'APPENDED', event: stored, ledger: Object.freeze([...ledger, stored]) });
}

export function projectHeadcount(ledger) {
  if (!Array.isArray(ledger)) throw new Error('MOVEMENT_LEDGER_INVALID');
  const current = new Map();
  for (const event of ledger) {
    current.set(event.detaineeId, { blockId: event.toBlockId, roomId: event.toRoomId, sequence: event.sequence });
  }
  const byRoom = new Map();
  for (const placement of current.values()) byRoom.set(placement.roomId, (byRoom.get(placement.roomId) ?? 0) + 1);
  return Object.freeze({ total: current.size, byRoom: Object.fromEntries(byRoom), placements: Object.fromEntries(current) });
}
