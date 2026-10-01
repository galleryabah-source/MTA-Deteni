import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker=fs.readFileSync('worker-v11.js','utf8');
const runtime=fs.readFileSync('web/mta-app-runtime-full.js','utf8');
const adapter=fs.readFileSync('web/mta-production-state-adapter-v1.js','utf8');
const provenance=fs.readFileSync('web/mta-provenance-v1.js','utf8');

assert.match(provenance,/mode:'PRODUCTION',source:'PRODUCTION_DB',database:runtime\.database==='CONNECTED'\?'CONNECTED':'DISCONNECTED',syntheticOnly:false/);
assert.match(provenance,/mode:'SYNTHETIC',source:'SYNTHETIC_RUNTIME',database:'DISCONNECTED',syntheticOnly:true/);
for(const marker of ['Runtime: SYNTHETIC','SYNTHETIC ONLY','Synthetic runtime; bukan data operasional nyata.','Provenance: synthetic-operational-runtime','Generated from verified structured synthetic records. Restricted operational fields are excluded.','ADMIN ONLY · Role synthetic saat ini:','Role synthetic:','Runtime tetap synthetic/local.']) assert.ok(provenance.includes(marker), 'provenance guard must explicitly reconcile stale marker: '+marker);
assert.match(provenance,/Production DB runtime; data operasional read-only\./);
assert.match(provenance,/production-db-read-only/);
assert.match(runtime,/mode:production\?'PRODUCTION':'SYNTHETIC'/);
assert.match(adapter,/window\.__mtaRuntimeStatus=\{mode:'PRODUCTION',database:'CONNECTED'/);
assert.doesNotMatch(worker,/dataMode:'SYNTHETIC_ONLY'/);
assert.doesNotMatch(worker,/livePostgresqlExecution:false/);
assert.doesNotMatch(worker,/realDetaineeDataAllowed:false/);
assert.match(worker,/dataMode:'PRODUCTION_DB'/);
assert.match(worker,/livePostgresqlExecution:true/);
assert.match(worker,/realDetaineeDataAllowed:true/);

const productionLoadedModules=[
  ['web/mta-unified-shell-v2.js','canonical operational shell'],
  ['web/preview-v5.js','synthetic preview V5'],
  ['web/preview-v6.js','synthetic preview V6'],
  ['web/daily-guard-report-d57.js','synthetic D5.7 report tooling'],
  ['web/mfe-evidence-v1.js','synthetic MFE evidence'],
  ['web/admin-settings-v9.js','admin control plane'],
  ['web/daily-guard-report-v2.js','daily guard report']
];
for(const [file,label] of productionLoadedModules){
  const source=fs.readFileSync(file,'utf8');
  assert.ok(source.length>0,'production-loaded module must be readable: '+label);
}
assert.match(fs.readFileSync('web/mfe-evidence-v1.js','utf8'),/SYNTHETIC_EVIDENCE_DISABLED_IN_PRODUCTION/);
assert.match(fs.readFileSync('web/daily-guard-report-d57.js','utf8'),/disabledInProduction:true/);
assert.match(fs.readFileSync('web/preview-v5.js','utf8'),/Preview sintetis dinonaktifkan pada production runtime/);
assert.match(fs.readFileSync('web/preview-v6.js','utf8'),/Preview sintetis dinonaktifkan pada production runtime/);
assert.doesNotMatch(fs.readFileSync('web/admin-settings-v9.js','utf8'),/Role synthetic:|Role synthetic saat ini:|Runtime tetap synthetic\/local\./);
assert.doesNotMatch(fs.readFileSync('web/daily-guard-report-v2.js','utf8'),/Generated from verified structured synthetic records/);

console.log('PROVENANCE SYNTHETIC LABEL FORENSIC REGRESSION PASS');
console.log('Production contract: PRODUCTION / PRODUCTION_DB / CONNECTED / syntheticOnly=false');
console.log('Synthetic contract: SYNTHETIC / SYNTHETIC_RUNTIME / DISCONNECTED / syntheticOnly=true');
console.log('Production worker no longer advertises synthetic-only or DB-disconnected health state');
