import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker-v11.js';

test('Cloudflare health contract preserves production governance locks', async () => {
  const response = await worker.fetch(new Request('https://mta-deteni.example/api/health'), {
    ASSETS: { fetch: async () => new Response('not-used') }
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.app, 'MTA DETENI');
  assert.equal(body.dataMode, 'PRODUCTION_DB');
  assert.equal(body.ai, 'OFF');
  assert.equal(body.migrationFreeze, true);
  assert.equal(body.productionAccessAuthorized, true);
  assert.equal(body.livePostgresqlExecution, true);
  assert.equal(body.realDetaineeDataAllowed, true);
  assert.equal(body.externalTransportAllowed, false);
  assert.equal(body.durablePublicationAllowed, false);
});
