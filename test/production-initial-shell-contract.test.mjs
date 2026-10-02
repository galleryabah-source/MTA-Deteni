import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('web/index.html','utf8');

const styleOpen=(index.match(/<style\\b/gi)||[]).length;
const styleClose=(index.match(/<\\/style>/gi)||[]).length;
assert.equal(styleOpen,styleClose,'index.html style tags must be balanced');

assert.match(index,/id="mtaAuthGate"[^>]*style="display:flex"/);
assert.match(index,/body:not\(.mta-auth-ready\) \.app\{display:none!important\}/);
assert.match(index,/body\.mta-auth-ready \.app\{display:grid!important\}/);

console.log('Production initial shell contract: PASS');
