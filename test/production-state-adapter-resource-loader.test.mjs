import fs from 'node:fs';
import assert from 'node:assert/strict';

const source=fs.readFileSync('web/mta-production-state-adapter-v1.js','utf8');
assert.match(source,/Promise\.all\(\['blocks','rooms','detainees','placements','movements','leaves','documents','audit','admin-config'\]\.map\(resource=>request\(resource\)\)\)/);
assert.doesNotMatch(source,/\.map\(list\)/);
assert.match(source,/async function request\(resource/);
console.log('Production state adapter resource loader contract: PASS');
