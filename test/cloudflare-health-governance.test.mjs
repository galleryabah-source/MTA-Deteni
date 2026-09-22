import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker-v11.js';

test('Cloudflare health contract preserves governance locks', async () => {
  const response = await worker.fetch(new Request('https://mta-deteni.example/api/health'), {
    ASSETS: { fetch: async () => new Response('not-used') }
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.app, 'MTA DETENI');
  assert.equal(body.dataMode, 'SYNTHETIC_ONLY');
  assert.equal(body.ai, 'OFF');
  assert.equal(body.migrationFreeze, true);
  assert.equal(body.productionAccessAuthorized, false);
  assert.equal(body.livePostgresqlExecution, false);
  assert.equal(body.realDetaineeDataAllowed, false);
  assert.equal(body.externalTransportAllowed, false);
  assert.equal(body.durablePublicationAllowed, false);
});
