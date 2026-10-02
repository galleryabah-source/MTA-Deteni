import assert from 'node:assert/strict';
import fs from 'node:fs';

const adapter=fs.readFileSync('web/mta-production-state-adapter-v1.js','utf8');
const runtime=fs.readFileSync('web/mta-app-runtime-full.js','utf8');

assert.match(adapter,/REQUEST_TIMEOUT_MS=10000/);
assert.match(adapter,/withTimeout\(fetch\(path,init\(\)\)\)/);
assert.match(adapter,/sessionOverride=null/);
assert.match(adapter,/const sessionToken=await session\(\)/);
assert.match(adapter,/Promise\.all\(resources\.map\(resource=>request\(resource,\{sessionOverride:sessionToken\}\)\)\)/);

assert.match(runtime,/renderProductionBootFailure/);
assert.match(runtime,/window\.mtaProductionStateAdapter\.hydrate\(\)\.then/);
assert.match(runtime,/Production bootstrap is fail-closed and non-blocking/);
assert.match(runtime,/if\(production\)[\\s\\S]*?return;/);
assert.doesNotMatch(runtime,/if\(window\.mtaProductionStateAdapter\?\.isProduction\(\)\) await window\.mtaProductionStateAdapter\.hydrate\(\)/);

console.log('P14.2 runtime hydration boundary regression: PASS');
