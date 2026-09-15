/**
 * Server-side command composition boundary.
 * Client-supplied actor/scope identity is never authoritative.
 */
export function composeAuthenticatedCommand({ principal, input, requiredScope = null } = {}) {
  if (!principal?.actorId || !principal?.scopeId) throw new Error('AUTHENTICATED_PRINCIPAL_REQUIRED');
  if (!input?.operation) throw new Error('COMMAND_OPERATION_REQUIRED');
  if (!input?.idempotencyKey?.trim()) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  if (requiredScope && principal.scopeId !== requiredScope) throw new Error('SCOPE_DENIED');
  if (input.actorId && input.actorId !== principal.actorId) throw new Error('CLIENT_ACTOR_MISMATCH');
  if (input.scopeId && input.scopeId !== principal.scopeId) throw new Error('CLIENT_SCOPE_MISMATCH');

  return Object.freeze({
    operation: input.operation,
    actorId: principal.actorId,
    scopeId: principal.scopeId,
    dutyId: principal.dutyId ?? null,
    classification: principal.classification ?? 'INTERNAL',
    resourceId: input.resourceId ?? null,
    idempotencyKey: input.idempotencyKey.trim(),
    payload: structuredClone(input.payload ?? {}),
    requestId: input.requestId ?? null,
    correlationId: input.correlationId ?? null,
  });
}

export function assertAuthenticatedCommandOwnership(command, principal) {
  if (!command || !principal) throw new Error('AUTHENTICATED_COMMAND_REQUIRED');
  if (command.actorId !== principal.actorId || command.scopeId !== principal.scopeId) {
    throw new Error('AUTHORITY_CONTEXT_MISMATCH');
  }
  return true;
}
