import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const runtime = readFileSync(new URL('../web/mta-app-runtime-full.js', import.meta.url), 'utf8');
const detail = readFileSync(new URL('../web/detainee-detail-v1.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');

assert.match(runtime, /show\('detainee-detail','\\?\$\{d\.id\\?\}'\)/);
assert.match(runtime, /class="dd-name"/);
assert.match(runtime, /Lihat</button>/);
assert.match(runtime, /function show\(v,id\)/);
assert.match(runtime, /v==='detainee-detail'/);
assert.match(runtime, /MTADetaineeDetailView/);
assert.match(runtime, /detailView\.detail\(id\)/);

assert.match(detail, /window\.MTADetaineeDetailView=Object\.freeze/);
assert.match(detail, /DETAINEE_DETAIL_VIEW/);
assert.match(detail, /document\.getElementById\('ddBack'\)/);

assert.match(index, /detainee-detail-v1\.js/);

console.log('MTA-F-20260927-022 Detainee Detail Navigation: PASS');
