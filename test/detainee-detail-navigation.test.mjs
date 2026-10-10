import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const runtime = readFileSync(new URL('../web/mta-app-runtime-full.js', import.meta.url), 'utf8');
const detail = readFileSync(new URL('../web/detainee-detail-v1.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');

assert.ok(runtime.includes("show('detainee-detail','${d.id}')"), 'detainee name/action must navigate to detail');
assert.ok(runtime.includes('class="dd-name"'), 'detainee name must be rendered as a clickable detail control');
assert.ok(runtime.includes('>Lihat</button>'), 'detainee row must expose a visible Lihat action');
assert.ok(runtime.includes('function show(v,id)'), 'show must accept a detainee id');
assert.ok(runtime.includes("v==='detainee-detail'"), 'show must recognize the detail route');
assert.ok(runtime.includes('MTADetaineeDetailView'), 'runtime must integrate with the canonical detail module');
assert.ok(runtime.includes('detailView.detail(id)'), 'runtime must invoke the canonical detail renderer');

assert.ok(detail.includes('window.MTADetaineeDetailView=Object.freeze'), 'detail module must expose its public API');
assert.ok(detail.includes('DETAINEE_DETAIL_VIEW'), 'detail view must emit an audit event');
assert.ok(detail.includes("document.getElementById('ddBack')"), 'detail view must provide back navigation');
assert.ok(detail.includes("document.getElementById('ddMovement')"), 'personal detail must expose movement action');
assert.ok(detail.includes("window.mtaUnifiedOpenMovement(id)"), 'movement action must preserve detainee context');
assert.ok(detail.includes("document.getElementById('ddLeave')"), 'personal detail must expose leave action');
assert.ok(detail.includes('[name="detaineeId"]'), 'leave action must bind the same detainee');

assert.ok(index.includes('detainee-detail-v1.js'), 'index must load the detail module');

console.log('MTA-F-20260927-022 Detainee Detail Navigation: PASS');