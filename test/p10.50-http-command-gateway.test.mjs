import test from 'node:test';
import assert from 'node:assert/strict';
import { createHttpCommandGateway } from '../src/runtime/http-command-gateway.mjs';

function session(overrides = {}) {
  return {
    userId: 'ACTOR-SYN-1', sessionId: 'SESSION-SYN-1', active: true, scope: 'SCOPE-1', csrfToken: 'CSRF-SYN-1',
    authz: {
      permissions: ['deteni.exit.create'], allowedScopes: ['SCOPE-1'], operationalAssignment: 'KAMTIB', requiredAssignment: 'KAMTIB', dutyActive: true,
      classificationAllowed: true, resourceExists: true, stateValid: true, policyAllowed: true, isSuperAdmin: false, superAdminOperationalBypass: false,
    }, ...overrides,
  };
}

test('P10.50 denies unauthenticated and CSRF-invalid mutations', async () => {
  const gateway = createHttpCommandGateway({ resolveSession: async () => null, commandHandlers: { 'POST /api/temporary-exit': { permission: 'deteni.exit.create', execute: async () => ({ ok: true }) } } });
  assert.equal((await gateway.handle({ method: 'POST', path: '/api/temporary-exit' })).status, 401);

  const protectedGateway = createHttpCommandGateway({ resolveSession: async () => session(), commandHandlers: { 'POST /api/temporary-exit': { permission: 'deteni.exit.create', execute: async () => ({ ok: true }) } } });
  assert.equal((await protectedGateway.handle({ method: 'POST', path: '/api/temporary-exit', headers: { 'x-csrf-token': 'wrong' } })).status, 403);
});

test('P10.50 authorizes server-side context and never trusts client scope', async () => {
  let called = false;
  const gateway = createHttpCommandGateway({
    resolveSession: async () => session(),
    commandHandlers: { 'POST /api/temporary-exit': { permission: 'deteni.exit.create', execute: async ({ scope }) => { called = true; return { scope }; } } },
  });
  const response = await gateway.handle({ method: 'POST', path: '/api/temporary-exit', headers: { 'x-csrf-token': 'CSRF-SYN-1' }, body: { scope: 'ATTACKER-SCOPE' } });
  assert.equal(response.status, 200);
  assert.equal(response.body.scope, 'SCOPE-1');
  assert.equal(called, true);
});

test('P10.50 denies policy context failures before command execution', async () => {
  let called = false;
  const gateway = createHttpCommandGateway({
    resolveSession: async () => session({ authz: { ...session().authz, dutyActive: false } }),
    commandHandlers: { 'POST /api/temporary-exit': { permission: 'deteni.exit.create', execute: async () => { called = true; return { ok: true }; } } },
  });
  const response = await gateway.handle({ method: 'POST', path: '/api/temporary-exit', headers: { 'x-csrf-token': 'CSRF-SYN-1' } });
  assert.equal(response.status, 403);
  assert.equal(response.body.code, 'DUTY_INACTIVE');
  assert.equal(called, false);
});
