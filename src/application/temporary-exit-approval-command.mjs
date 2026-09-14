import { authorize } from '../kernel/p9-kernel.mjs';
import { TransactionalKernelStore } from '../kernel/transactional-command.mjs';
import { buildTemporaryExitApprovalRecord } from '../domain/temporary-exit-approval.mjs';

export function executeTemporaryExitApproval({ authContext, detaineeId, actorId, approverId, scope, requestId, correlationId, idempotencyKey, purpose, currentState, store = new TransactionalKernelStore() }) {
  const approval = buildTemporaryExitApprovalRecord({ detaineeId, actorId, approverId, scope, requestId, correlationId, purpose, currentState });
  const decision = authorize({ ...authContext, scope, permission: 'deteni.exit.approve' });
  if (!decision.allowed) return Object.freeze({ status: 'DENIED', reasonCode: decision.reasonCode, policyVersion: decision.policyVersion });
  return store.command({
    idempotencyKey,
    request: approval,
    domainMutation: ({ set }) => set(detaineeId, { state: 'EXIT_APPROVED', approvalRequestId: requestId, approverId }),
    auditEvent: { eventId: `audit-${requestId}`, actorId, action: 'TEMPORARY_EXIT_APPROVE', resourceType: 'DETAINEE_TEMPORARY_EXIT', resourceId: detaineeId, result: 'SUCCESS', requestId, correlationId, policyVersion: decision.policyVersion, scope, approverId, occurredAt: new Date().toISOString() },
    outboxEvent: { eventId: `exit-approved-${requestId}`, eventType: 'DETAINEE_TEMP_EXIT_APPROVED', aggregateType: 'DETAINEE', aggregateId: detaineeId, correlationId, causationId: requestId, payloadVersion: '1.0', availableAt: 0, payload: { synthetic: true, state: 'EXIT_APPROVED', approverId, purpose } },
  });
}
