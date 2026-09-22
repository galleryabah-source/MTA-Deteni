import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = p => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('deployment parity contract keeps auth/RBAC boundary in the Cloudflare asset path', () => {
  const wrangler = read('wrangler.toml');
  const worker = read('worker-v11.js');
  const index = read('web/index.html');
  const authUi = read('web/mta-auth-ui.js');
  const auth = read('web/mta-auth.js');
  const api = read('web/mta-production-api.js');
  const guard = read('web/mta-rbac-action-guard.js');

  assert.match(wrangler, /main\s*=\s*"worker-v11\.js"/);
  assert.match(wrangler, /directory\s*=\s*"\.\/web"/);
  assert.match(worker, /env\.ASSETS\.fetch\(request\)/);
  assert.match(worker, /\/api\/mta\//);
  assert.match(worker, /SUPABASE_PRODUCTION_SCHEMA_READY_RLS_DENY_DEFAULT/);

  assert.match(index, /\/mta-production-api\.js/);
  assert.match(index, /\/mta-auth-ui\.js/);
  assert.match(index, /\/mta-auth\.js/);
  assert.match(index, /\/mta-rbac-action-guard\.js/);

  assert.match(authUi, /mtaAuth\.signIn/);
  assert.match(authUi, /mtaProductionApi\.get\('me'\)/);
  assert.match(authUi, /RBAC_ROLE_NOT_ASSIGNED/);
  assert.match(authUi, /body\.mta-auth-guest \.app/);
  assert.doesNotMatch(authUi, /signUp\(/);

  assert.match(auth, /window\.mtaAuth/);
  assert.doesNotMatch(auth, /mtaAuth\.client/);
  assert.match(api, /Authorization/);
  assert.match(api, /Bearer/);

  assert.match(guard, /RBAC_ACTION_DENIED/);
  assert.match(guard, /canAction/);
});

test('deployment health contract exposes explicit auth/RBAC parity markers', () => {
  const worker = read('worker-v11.js');
  assert.match(worker, /DEPLOYMENT_PARITY_CONTRACT_V1/);
  assert.match(worker, /DEDICATED_LOGIN_REQUIRED/);
  assert.match(worker, /CANONICAL_5_ROLE_RBAC/);
  assert.match(worker, /ACTION_GUARD_ENABLED/);
});

console.log('DEPLOYMENT_PARITY_AUTH_RBAC PASS');
