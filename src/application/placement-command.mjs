import { authorize } from '../kernel/p9-kernel.mjs';
import { TransactionalKernelStore } from '../kernel/transactional-command.mjs';
import { validatePlacementCommand, buildPlacementRecord } from '../domain/placement.mjs';

export function executePlacement({ authContext, detaineeId, detaineeState = 'ACTIVE', sourceRoomId = null, targetBlockId, targetRoomId, targetCapacityRemaining, actorId, scope, requestId, correlationId, idempotencyKey, store = new TransactionalKernelStore() }) {
  const command = validatePlacementCommand({ detaineeId, detaineeState, sourceRoomId, targetBlockId, targetRoomId, actorId, scope, requestId, correlationId, targetCapacityRemaining });
  const decision = authorize({ ...authContext, scope, permission: 'deteni.placement.transfer', resourceExists: true, stateValid: true });
  if (!decision.allowed) return Object.freeze({ status: 'DENIED', reasonCode: decision.reasonCode, policyVersion: decision.policyVersion });

  return store.command({
    idempotencyKey,
    request: { ...command, payload: { sourceRoomId: command.sourceRoomId, targetBlockId: command.targetBlockId, targetRoomId: command.targetRoomId } },
    domainMutation: ({ set }) => set(detaineeId, buildPlacementRecord(command)),
    auditEvent: { eventId: `audit-${requestId}`, actorId, action: 'PLACEMENT_TRANSFER', resourceType: 'DETAINEE_PLACEMENT', resourceId: detaineeId, result: 'SUCCESS', requestId, correlationId, policyVersion: decision.policyVersion, scope, occurredAt: new Date().toISOString() },
    outboxEvent: { eventId: `placement-transferred-${requestId}`, eventType: 'DETAINEE_PLACEMENT_TRANSFERRED', aggregateType: 'DETAINEE', aggregateId: detaineeId, correlationId, causationId: requestId, payloadVersion: '1.0', availableAt: 0, payload: { synthetic: true, sourceRoomId: command.sourceRoomId, targetBlockId: command.targetBlockId, targetRoomId: command.targetRoomId } },
  });
}
