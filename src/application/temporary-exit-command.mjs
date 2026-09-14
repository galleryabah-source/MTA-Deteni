import { authorize } from '../kernel/p9-kernel.mjs';
import { TransactionalKernelStore } from '../kernel/transactional-command.mjs';
import { createSyntheticLeaveCommand } from '../domain/deteni-lifecycle.mjs';

export function executeTemporaryExit({ authContext, detaineeId, actorId, scope, requestId, correlationId, idempotencyKey, store = new TransactionalKernelStore() }) {
  const command = createSyntheticLeaveCommand({ detaineeId, actorId, scope, requestId, correlationId });
  const decision = authorize({ ...authContext, scope, permission: 'deteni.exit.create' });
  if (!decision.allowed) return Object.freeze({ status: 'DENIED', reasonCode: decision.reasonCode, policyVersion: decision.policyVersion });

  return store.command({
    idempotencyKey,
    request: command,
    domainMutation: ({ set }) => set(detaineeId, { state: 'EXIT_REQUESTED', lastRequestId: requestId }),
    auditEvent: { eventId: `audit-${requestId}`, actorId, action: 'LEAVE_CREATE', resourceType: 'DETAINEE_TEMPORARY_EXIT', resourceId: detaineeId, result: 'SUCCESS', requestId, correlationId, policyVersion: decision.policyVersion, scope, occurredAt: new Date().toISOString() },
    outboxEvent: { eventId: `exit-requested-${requestId}`, eventType: 'DETAINEE_TEMP_EXIT_REQUESTED', aggregateType: 'DETAINEE', aggregateId: detaineeId, correlationId, causationId: requestId, payloadVersion: '1.0', availableAt: 0, payload: { synthetic: true, state: 'EXIT_REQUESTED' } },
  });
}
