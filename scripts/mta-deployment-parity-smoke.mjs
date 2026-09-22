#!/usr/bin/env node

const base = (process.argv[2] || '').replace(/\/$/, '');
if (!base) {
  console.error('Usage: node scripts/mta-deployment-parity-smoke.mjs <worker-url>');
  process.exit(2);
}

const url = base + '/api/health';
const response = await fetch(url, { headers: { accept: 'application/json' } });
if (!response.ok) {
  throw new Error('HEALTH_HTTP_' + response.status);
}
const payload = await response.json();

const expected = {
  deploymentContract: 'DEPLOYMENT_PARITY_CONTRACT_V1',
  authBoundary: 'DEDICATED_LOGIN_REQUIRED',
  rbacContract: 'CANONICAL_5_ROLE_RBAC',
  actionGuard: 'ACTION_GUARD_ENABLED'
};

for (const [key, value] of Object.entries(expected)) {
  if (payload[key] !== value) {
    throw new Error(`PARITY_MISMATCH ${key}: expected ${value}, got ${payload[key] ?? 'MISSING'}`);
  }
}

console.log('DEPLOYMENT_PARITY_SMOKE PASS');
