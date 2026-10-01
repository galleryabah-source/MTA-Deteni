import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker=fs.readFileSync('worker-v11.js','utf8');
const runtime=fs.readFileSync('web/mta-app-runtime-full.js','utf8');
const adapter=fs.readFileSync('web/mta-production-state-adapter-v1.js','utf8');
const provenance=fs.readFileSync('web/mta-provenance-v1.js','utf8');

assert.match(provenance,/mode:'PRODUCTION',source:'PRODUCTION_DB',database:runtime\.database==='CONNECTED'\?'CONNECTED':'DISCONNECTED',syntheticOnly:false/);
assert.match(provenance,/mode:'SYNTHETIC',source:'SYNTHETIC_RUNTIME',database:'DISCONNECTED',syntheticOnly:true/);
assert.match(runtime,/mode:production\?'PRODUCTION':'SYNTHETIC'/);
assert.match(adapter,/window\.__mtaRuntimeStatus=\{mode:'PRODUCTION',database:'CONNECTED'/);
assert.doesNotMatch(worker,/dataMode:'SYNTHETIC_ONLY'/);
assert.doesNotMatch(worker,/livePostgresqlExecution:false/);
assert.doesNotMatch(worker,/realDetaineeDataAllowed:false/);
assert.match(worker,/dataMode:'PRODUCTION_DB'/);
assert.match(worker,/livePostgresqlExecution:true/);
assert.match(worker,/realDetaineeDataAllowed:true/);

console.log('PROVENANCE SYNTHETIC LABEL FORENSIC REGRESSION PASS');
console.log('Production contract: PRODUCTION / PRODUCTION_DB / CONNECTED / syntheticOnly=false');
console.log('Synthetic contract: SYNTHETIC / SYNTHETIC_RUNTIME / DISCONNECTED / syntheticOnly=true');
console.log('Production worker no longer advertises synthetic-only or DB-disconnected health state');
