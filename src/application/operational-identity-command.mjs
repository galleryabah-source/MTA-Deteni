import { authorize } from '../kernel/p9-kernel.mjs';
import { TransactionalKernelStore } from '../kernel/transactional-command.mjs';
import { resolveOperationalIdentity, assertIdentityCannotAuthorize } from '../domain/operational-identity.mjs';

export function executeIdentityScan({ authContext, identityType, opaqueToken, actorId, scope, requestId, correlationId, idempotencyKey, registry, store = new TransactionalKernelStore() }) {
  const resolution = resolveOperationalIdentity(registry, { identityType, opaqueToken, requestId, correlationId });
  assertIdentityCannotAuthorize(resolution);
  if (resolution.status !== 'RESOLVED') return Object.freeze({ status: 'NOT_FOUND', requestId, correlationId });
  if (!resolution.active) return Object.freeze({ status: 'INACTIVE', requestId, correlationId, detaineeId: resolution.detaineeId });

  const decision = authorize({ ...authContext, scope, permission: 'deteni.identity.scan', resourceExists: true, stateValid: true });
  if (!decision.allowed) return Object.freeze({ status: 'DENIED', reasonCode: decision.reasonCode, policyVersion: decision.policyVersion });

  return store.command({
    idempotencyKey,
    request: { operation: 'IDENTITY_SCAN', detaineeId: resolution.detaineeId, identityType, opaqueToken, actorId, scope, requestId, correlationId },
    domainMutation: ({ set }) => set(`identity-scan:${requestId}`, { operation: 'IDENTITY_SCAN', detaineeId: resolution.detaineeId, placementId: resolution.placementId, status: 'RESOLVED' }),
    auditEvent: { eventId: `audit-${requestId}`, actorId, action: 'OPERATIONAL_IDENTITY_SCAN', resourceType: 'DETAINEE_IDENTITY', resourceId: resolution.detaineeId, result: 'SUCCESS', requestId, correlationId, policyVersion: decision.policyVersion, scope, occurredAt: new Date().toISOString() },
    outboxEvent: { eventId: `identity-scanned-${requestId}`, eventType: 'OPERATIONAL_IDENTITY_SCANNED', aggregateType: 'DETAINEE', aggregateId: resolution.detaineeId, correlationId, causationId: requestId, payloadVersion: '1.0', availableAt: 0, payload: { synthetic: true, identityType, opaqueToken, placementId: resolution.placementId } },
  });
}
