const REQUIRED = Object.freeze(['exitId', 'actorId', 'scopeId', 'idempotencyKey']);

export function assertTemporaryExitCommandInput(input) {
  if (!input || typeof input !== 'object') throw new Error('TEMPORARY_EXIT_COMMAND_REQUIRED');
  for (const key of REQUIRED) {
    if (typeof input[key] !== 'string' || input[key].trim() === '') throw new Error(`MISSING_COMMAND_FIELD:${key}`);
  }
  if (input.clientActorId !== undefined && input.clientActorId !== input.actorId) {
    throw new Error('CLIENT_ACTOR_ID_MISMATCH');
  }
  if (input.clientScopeId !== undefined && input.clientScopeId !== input.scopeId) {
    throw new Error('CLIENT_SCOPE_ID_MISMATCH');
  }
  return true;
}

export function createCommandFingerprint({ operation, actorId, scopeId, resourceId, idempotencyKey, payload }) {
  if (![operation, actorId, scopeId, resourceId, idempotencyKey].every((v) => typeof v === 'string' && v.trim())) {
    throw new Error('COMMAND_FINGERPRINT_CONTEXT_REQUIRED');
  }
  return JSON.stringify({ operation, actorId, scopeId, resourceId, idempotencyKey, payload: payload ?? null });
}
