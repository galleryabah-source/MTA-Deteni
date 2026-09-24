import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const authUi=fs.readFileSync(new URL('../web/mta-auth-ui.js',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('../worker-v11.js',import.meta.url),'utf8');

test('Phase 10 synthetic auth does not probe unavailable production /me endpoint',()=>{
  assert.doesNotMatch(authUi,/mtaProductionApi\?\.get\(['"]me['"]\)/);
  assert.match(authUi,/Synthetic runtime is deliberately not coupled to \/api\/mta\/me/);
  assert.match(worker,/productionAccessAuthorized: false/);
  assert.match(worker,/livePostgresqlExecution: false/);
});
