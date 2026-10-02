import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('web/index.html','utf8');

const styleOpen=index.split('<style').length-1;
const styleClose=index.split('</style>').length-1;
assert.equal(styleOpen,styleClose,'index.html style tags must be balanced');

assert.match(index,/id="mtaAuthGate"[^>]*style="display:flex"/);
assert.match(index,/body:not\(.mta-auth-ready\) \.app\{display:none!important\}/);
assert.match(index,/body\.mta-auth-ready \.app\{display:grid!important\}/);

console.log('Production initial shell contract: PASS');
