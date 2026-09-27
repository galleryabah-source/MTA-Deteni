import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync('web/mta-production-state-adapter-v1.js','utf8');
assert.match(source,/const PRODUCTION_HOSTS=new Set\(\['mta-deteni\.galleryabah\.workers\.dev'\]\)/);
assert.match(source,/const isProduction=\(\)=>PRODUCTION_HOSTS\.has\(location\.hostname\)/);
assert.doesNotMatch(source,/SYNTHETIC_HOSTS/);
console.log('Staging/production boundary contract: PASS');
