import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/kernel/config.js';
import { authorize } from '../src/kernel/authz.js';
import { appendAuditEvent, verifyAuditChain } from '../src/kernel/audit.js';

describe('P9 configuration', () => {
  it('allows AI-off without AI credentials', () => {
    const config = loadConfig({ APP_ENV: 'test', AI_ENABLED: 'false' });
    expect(config.aiEnabled).toBe(false);
    expect(config.aiApiKey).toBeUndefined();
  });

  it('fails closed for missing production secrets', () => {
    expect(() => loadConfig({ APP_ENV: 'production' })).toThrow(/DATABASE_URL/);
  });
});

describe('P9 authorization', () => {
  const base = {
    auth: { userId: 'u1', sessionId: 's1', active: true },
    permission: 'leave.complete',
    permissions: ['leave.complete'],
    scope: 'RUDENIM-01',
    allowedScopes: ['RUDENIM-01'],
    operationalAssignment: 'PETUGAS_JAGA',
    requiredAssignment: 'PETUGAS_JAGA',
    dutyActive: true,
    classificationAllowed: true,
    resourceExists: true,
    stateValid: true,
    policyAllowed: true,
    isSuperAdmin: false,
    superAdminOperationalBypass: false,
  } as const;

  it('allows a valid operational actor', () => {
    expect(authorize(base)).toMatchObject({ allowed: true, reasonCode: 'ALLOW' });
  });

  it('denies wrong scope', () => {
    expect(authorize({ ...base, scope: 'OTHER' })).toMatchObject({ allowed: false, reasonCode: 'SCOPE_DENIED' });
  });

  it('denies missing duty', () => {
    expect(authorize({ ...base, dutyActive: false })).toMatchObject({ allowed: false, reasonCode: 'DUTY_INACTIVE' });
  });

  it('denies Super Admin operational bypass', () => {
    expect(authorize({ ...base, isSuperAdmin: true, superAdminOperationalBypass: true })).toMatchObject({ allowed: false, reasonCode: 'SUPER_ADMIN_OPERATIONAL_BYPASS' });
  });
});

describe('P9 audit hash chain', () => {
  const event = (id: string, occurredAt: string) => ({
    eventId: id,
    actorId: 'u1',
    action: 'TEST_ACTION',
    resourceType: 'TEST',
    resourceId: id,
    result: 'SUCCESS' as const,
    requestId: 'req-1',
    correlationId: 'corr-1',
    policyVersion: 'AUTHZ-1.0',
    scope: 'RUDENIM-01',
    occurredAt,
  });

  it('detects tampering', () => {
    const first = appendAuditEvent(event('1', '2026-09-14T00:00:00.000Z'), null);
    const second = appendAuditEvent(event('2', '2026-09-14T00:01:00.000Z'), first.hash);
    expect(verifyAuditChain([first, second])).toBe(true);
    const tampered = { ...second, action: 'TAMPERED' };
    expect(verifyAuditChain([first, tampered])).toBe(false);
  });
});
