import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const source=readFileSync(new URL('../web/detainee-detail-v1.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');

assert.match(source,/function list\(\)/);
assert.match(source,/async function detail\(id\)/);
assert.match(source,/timelineFor/);
assert.match(source,/DEPORTASI/);
assert.match(source,/DETAINEE_DOCUMENT_DOWNLOAD/);
assert.match(source,/DETAINEE_DOCUMENT_PRINT/);
assert.match(source,/application\/msword/);
assert.match(source,/mta:\/\/detainee\//);
assert.match(source,/window\.show=function/);
assert.match(index,/detainee-detail-v1\.js/);

console.log('MTA-F-20260926-002 detainee detail static contract: PASS');
