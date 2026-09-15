import { randomUUID } from 'node:crypto';
import { authorize } from '../kernel/p9-kernel.mjs';
import { composeAuthenticatedCommand } from '../application/authenticated-command-composer.mjs';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function requiredString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${name} is required`);
  return value.trim();
}

function header(headers, name) {
  if (!headers || typeof headers !== 'object') return null;
  const key = Object.keys(headers).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : null;
}

export function createHttpCommandGateway({ resolveSession, commandHandlers = Object.create(null), now = () => new Date().toISOString() }) {
  if (typeof resolveSession !== 'function') throw new Error('resolveSession is required');

  return Object.freeze({
    async handle({ method = 'GET', path, headers = {}, body = null, requestId = randomUUID(), correlationId = requestId }) {
      const normalizedMethod = String(method).toUpperCase();
      const normalizedPath = requiredString(path, 'path');
      const session = await resolveSession({ headers, requestId });
      if (!session?.active) return { status: 401, body: { code: 'AUTH_REQUIRED', requestId } };

      if (MUTATING_METHODS.has(normalizedMethod)) {
        const csrf = header(headers, 'x-csrf-token');
        const csrfExpected = session.csrfToken;
        if (!csrfExpected || csrf !== csrfExpected) return { status: 403, body: { code: 'CSRF_DENIED', requestId } };
      }

      const route = `${normalizedMethod} ${normalizedPath}`;
      const handler = commandHandlers[route];
      if (typeof handler !== 'function') return { status: 404, body: { code: 'ROUTE_NOT_FOUND', requestId } };

      const decision = authorize({
        ...session.authz,
        auth: { userId: session.userId, sessionId: session.sessionId, active: true },
        permission: handler.permission,
        scope: session.scope,
      });
      if (!decision.allowed) return { status: 403, body: { code: decision.reasonCode, policyVersion: decision.policyVersion, requestId } };

      let command;
      try {
        command = composeAuthenticatedCommand({
          principal: {
            actorId: session.userId,
            scopeId: session.scope,
            dutyId: session.dutyId ?? null,
            classification: session.classification ?? 'INTERNAL',
          },
          input: {
            operation: handler.operation ?? route,
            resourceId: body?.resourceId ?? body?.exitId ?? null,
            idempotencyKey: header(headers, 'idempotency-key') ?? body?.idempotencyKey,
            actorId: body?.actorId,
            scopeId: body?.scopeId,
            payload: body?.payload ?? body,
            requestId,
            correlationId,
          },
          requiredScope: handler.requiredScope ?? null,
        });
      } catch (error) {
        return { status: 400, body: { code: error?.message ?? 'COMMAND_COMPOSITION_DENIED', requestId } };
      }

      const result = await handler.execute({
        command,
        actorId: command.actorId,
        scope: command.scopeId,
        body: command.payload,
        requestId: command.requestId,
        correlationId: command.correlationId,
        occurredAt: now(),
      });
      return { status: 200, body: result };
    },
  });
}
