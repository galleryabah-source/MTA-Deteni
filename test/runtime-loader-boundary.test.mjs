import assert from 'node:assert/strict';
import fs from 'node:fs';

const loader=fs.readFileSync('web/mta-app-runtime.js','utf8');
const index=fs.readFileSync('web/index.html','utf8');

assert.match(loader,/mta-app-runtime-full\.js\?v=23/);
assert.match(loader,/mta-provenance-v1\.js\?v=2/);
assert.match(loader,/loadOperationalRuntime\(\);\s*loadProvenance\(\);/);
assert.doesNotMatch(loader,/provenance\.onload\s*=\s*\(\)=>\s*\{/);
assert.doesNotMatch(loader,/operational runtime blocked/);
assert.match(loader,/mta-operational-runtime-failed/);
assert.match(index,/mta-app-runtime\.js\?v=13/);

console.log('Runtime loader boundary regression: PASS');
