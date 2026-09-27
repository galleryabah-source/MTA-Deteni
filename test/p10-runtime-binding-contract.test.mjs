import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const index=read('web/index.html');
const api=read('web/mta-production-api.js');
const kernel=read('web/mta-state-kernel-v1.js');
const runtime=read('web/mta-app-runtime-full.js');
const edge=read('supabase/functions/mta-api/index.ts');

const productionApiPos=index.indexOf('/mta-production-api.js');
const kernelPos=index.indexOf('/mta-state-kernel-v1.js');
const authUiPos=index.indexOf('/mta-auth-ui.js');
assert(productionApiPos>=0 && kernelPos>productionApiPos && authUiPos>kernelPos,'canonical scripts must load API -> state kernel -> auth UI');

assert.match(api,/Idempotency-Key/);
assert.match(api,/stableHash/);
assert.match(kernel,/productionAccessAuthorized/);
assert.match(kernel,/livePostgresqlExecution/);
assert.match(kernel,/mtaProductionApi\.list\('detainees'\)/);
assert.match(kernel,/mtaProductionApi\.list\('audit'\)/);
assert.match(kernel,/syncCollection/);
assert.match(kernel,/NO_SYNTHETIC_FALLBACK_AFTER_REMOTE_AUTH/);
assert.match(kernel,/refusing synthetic fallback/);

const readyAwait=runtime.indexOf('await window.MTADeteniStateKernel.ready()');
const dbLoad=runtime.indexOf('db=load()');
assert(readyAwait>=0 && dbLoad>readyAwait,'runtime must hydrate/govern before reading application state');
assert(!runtime.includes('/mta-state-kernel-v1.js?v=4'),'authenticated enhancement loader must not bootstrap a second state kernel');

assert.match(edge,/resource==="audit" && req\.method==="GET"/);
assert.match(edge,/AUDIT_READ_FAILED/);
assert.match(edge,/mta_execute_idempotent_mutation/);

console.log('P10 RUNTIME BINDING CONTRACT: PASS');
