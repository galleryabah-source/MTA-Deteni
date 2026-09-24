import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../web/mta-unified-shell-v2.js',import.meta.url),'utf8');

test('Phase 10 unified shell must remain complete and executable',()=>{
  assert.ok(source.length>40000,'unified shell unexpectedly truncated');
  assert.match(source,/mta:unified-ready/);
  assert.match(source,/mtaUnifiedNavigationContractTest/);
  assert.match(source,/mtaUnifiedMutationConsistencyContractTest/);
  assert.match(source,/mtaUnifiedOfflineRecoveryContractTest/);
  assert.match(source,/finalIntegrityGate\(\)/);
  assert.match(source,/desktop-shell-v2\.js\?v=5/);
});
