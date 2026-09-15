import { authorize } from '../kernel/p9-kernel.mjs';
import { TransactionalKernelStore } from '../kernel/transactional-command.mjs';
import { validateMovementEvent, appendMovementEvent } from '../domain/movement-ledger.mjs';

export function executeMovement({ authContext, ledger = [], detaineeId, detaineeState = 'ACTIVE', fromBlockId = null, fromRoomId = null, toBlockId, toRoomId, actorId, scope, requestId, correlationId, idempotencyKey, store = new TransactionalKernelStore() }) {
  const movement = validateMovementEvent({ detaineeId, detaineeState, fromBlockId, fromRoomId, toBlockId, toRoomId, actorId, scope, requestId, correlationId });
  const decision = authorize({ ...authContext, scope, permission: 'deteni.placement.transfer', resourceExists: true, stateValid: true });
  if (!decision.allowed) return Object.freeze({ status: 'DENIED', reasonCode: decision.reasonCode, policyVersion: decision.policyVersion });
  const preview = appendMovementEvent(ledger, movement);
  if (preview.status === 'REPLAY') return Object.freeze({ status: 'REPLAY', event: preview.event, ledger: preview.ledger });
  return store.command({
    idempotencyKey,
    request: { ...movement, payload: { fromBlockId: movement.fromBlockId, fromRoomId: movement.fromRoomId, toBlockId: movement.toBlockId, toRoomId: movement.toRoomId } },
    domainMutation: ({ set }) => set(detaineeId, { detaineeId, blockId: toBlockId, roomId: toRoomId, status: 'ACTIVE', requestId }),
    auditEvent: { eventId: `audit-${requestId}`, actorId, action: 'MOVEMENT_APPEND', resourceType: 'DETAINEE_MOVEMENT', resourceId: detaineeId, result: 'SUCCESS', requestId, correlationId, policyVersion: decision.policyVersion, scope, occurredAt: new Date().toISOString() },
    outboxEvent: { eventId: `movement-appended-${requestId}`, eventType: 'DETAINEE_MOVEMENT_RECORDED', aggregateType: 'DETAINEE', aggregateId: detaineeId, correlationId, causationId: requestId, payloadVersion: '1.0', availableAt: 0, payload: { synthetic: true, movement: preview.event } },
  });
}
