import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker-v11.js';

test('Cloudflare health contract preserves production governance locks', async () => {
  const env = { MTA_DEPLOY_COMMIT: 'test-commit-123', ASSETS: { fetch: async () => new Response('not-used') } };
  const response = await worker.fetch(new Request('https://mta-deteni.example/api/health'), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.app, 'MTA DETENI');
  assert.equal(body.deploymentSource, 'GITHUB_MAIN');
  assert.equal(body.deploymentCommit, 'test-commit-123');
  assert.equal(body.dataMode, 'PRODUCTION_DB');
  assert.equal(body.database, 'NOT_PROBED');
  assert.equal(body.storage, 'NOT_PROBED');
  assert.equal(body.ai, 'OFF');
  assert.equal(body.migrationFreeze, true);
  assert.equal('productionAccessAuthorized' in body, false);
  assert.equal('livePostgresqlExecution' in body, false);
  assert.equal('realDetaineeDataAllowed' in body, false);
  assert.equal(body.externalTransportAllowed, false);
  assert.equal(body.durablePublicationAllowed, false);

  const runtimeResponse = await worker.fetch(new Request('https://mta-deteni.example/api/runtime'), env);
  assert.equal(runtimeResponse.status, 200);
  const runtime = await runtimeResponse.json();
  assert.equal(runtime.mode, 'PRODUCTION_RUNTIME');
  assert.equal(runtime.source, 'PRODUCTION_DB');
  assert.equal(runtime.database, 'NOT_PROBED');
  assert.equal(runtime.productionDatabase, 'NOT_PROBED');
  assert.equal(runtime.productionStorage, 'NOT_PROBED');
  assert.equal('productionAccessAuthorized' in runtime, false);
  assert.equal('livePostgresqlExecution' in runtime, false);
  assert.equal(runtime.syntheticOnly, false);
  assert.equal(runtime.deploymentSource, 'GITHUB_MAIN');
  assert.equal(runtime.deploymentCommit, 'test-commit-123');
});
