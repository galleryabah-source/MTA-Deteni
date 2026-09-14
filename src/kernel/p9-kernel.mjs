import { createHash } from 'node:crypto';

export function loadConfig(env = process.env) {
  const appEnv = env.APP_ENV ?? env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'staging', 'production'].includes(appEnv)) throw new Error('Invalid APP_ENV');
  const required = (key) => {
    const value = env[key]?.trim();
    if (!value) throw new Error(`Missing required configuration: ${key}`);
    return value;
  };
  const aiEnabled = env.AI_ENABLED === 'true';
  if (aiEnabled) { required('AI_PROVIDER'); required('AI_API_KEY'); }
  const config = { appName: env.APP_NAME?.trim() || 'MTA DETENI', appVersion: env.APP_VERSION?.trim() || '0.1.0', appEnv, aiEnabled };
  if (appEnv === 'production') {
    config.databaseUrl = required('DATABASE_URL');
    config.authSecret = required('AUTH_SECRET');
    config.sessionSecret = required('SESSION_SECRET');
  }
  if (aiEnabled) { config.aiProvider = required('AI_PROVIDER'); config.aiApiKey = required('AI_API_KEY'); }
  return Object.freeze(config);
}

export function authorize(input) {
  const deny = (reasonCode) => ({ allowed: false, reasonCode, policyVersion: 'AUTHZ-1.0' });
  if (!input.auth?.active) return deny('AUTH_REQUIRED');
  if (!input.permissions.includes(input.permission)) return deny('PERMISSION_DENIED');
  if (!input.allowedScopes.includes(input.scope)) return deny('SCOPE_DENIED');
  if (input.requiredAssignment && input.operationalAssignment !== input.requiredAssignment) return deny('DUTY_REQUIRED');
  if (input.requiredAssignment && !input.dutyActive) return deny('DUTY_INACTIVE');
  if (!input.classificationAllowed) return deny('RESOURCE_CLASSIFICATION_DENIED');
  if (!input.resourceExists) return deny('RESOURCE_NOT_FOUND');
  if (!input.stateValid) return deny('INVALID_STATE');
  if (!input.policyAllowed) return deny('POLICY_DENIED');
  if (input.isSuperAdmin && input.superAdminOperationalBypass) return deny('SUPER_ADMIN_OPERATIONAL_BYPASS');
  return { allowed: true, reasonCode: 'ALLOW', policyVersion: 'AUTHZ-1.0' };
}

function material(event) {
  return JSON.stringify({ hashVersion: event.hashVersion, eventId: event.eventId, actorId: event.actorId ?? null, action: event.action, resourceType: event.resourceType, resourceId: event.resourceId ?? null, result: event.result, requestId: event.requestId, correlationId: event.correlationId, policyVersion: event.policyVersion ?? null, scope: event.scope ?? null, occurredAt: event.occurredAt, previousHash: event.previousHash });
}

export function appendAuditEvent(input, previousHash = null) {
  const event = Object.freeze({ ...input, previousHash, hashVersion: 'AUDIT-HASH-V1' });
  const hash = createHash('sha256').update(material(event), 'utf8').digest('hex');
  return Object.freeze({ ...event, hash });
}

export function verifyAuditChain(events) {
  let previousHash = null;
  for (const event of events) {
    if (event.previousHash !== previousHash) return false;
    const expected = createHash('sha256').update(material(event), 'utf8').digest('hex');
    if (expected !== event.hash) return false;
    previousHash = event.hash;
  }
  return true;
}
