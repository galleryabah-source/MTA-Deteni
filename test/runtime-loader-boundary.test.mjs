import assert from 'node:assert/strict';
import fs from 'node:fs';

const loader=fs.readFileSync('web/mta-app-runtime.js','utf8');
const runtime=fs.readFileSync('web/mta-app-runtime-full.js','utf8');
const index=fs.readFileSync('web/index.html','utf8');

assert.match(loader,/mta-app-runtime-full\.js\?v=24 \(static deferred in index\.html\)/);
assert.match(index,/mta-app-runtime-full\.js\?v=24/);
assert.match(index,/data-mta-operational-runtime="static"/);
assert.match(loader,/loadProvenance\(\);/);
assert.doesNotMatch(loader,/loadOperationalRuntime/);
assert.doesNotMatch(loader,/operational runtime blocked/);
assert.match(loader,/__mtaOperationalRuntimeAssetFailed/);
assert.match(runtime,/window.__mtaOperationalRuntimeLoaded=false/);
assert.match(runtime,/window.__mtaOperationalRuntimeLoaded=true;[\\s\\S]*window\.dispatchEvent\(new CustomEvent\('mta-operational-runtime-loaded'\)\)/);
assert.ok(runtime.indexOf('window.__mtaOperationalRuntimeLoaded=false') < runtime.indexOf('window.__mtaOperationalRuntimeLoaded=true;'));
assert.match(runtime,/mta-production-state-adapter-v1\.js\?v=7/);
const adapter=fs.readFileSync('web/mta-production-state-adapter-v1.js','utf8');
assert.match(adapter,/localStorage\?\.getItem\('mta-deteni-auth-session'\)/);
assert.match(adapter,/window\.mtaAuth\?\.session\?\.\(\)/);
assert.match(index,/mta-app-runtime\.js\?v=13/);
assert.match(index,/mtaRuntimeErrorBoundaryInstalled/);
assert.ok(index.indexOf('mtaRuntimeErrorBoundaryInstalled') < index.indexOf('mta-app-runtime-full.js?v=24'));
assert.match(index,/mta-production-state-adapter-v1\.js\?v=7\&legacy-placement=1/);

console.log('Runtime loader boundary regression: PASS');
