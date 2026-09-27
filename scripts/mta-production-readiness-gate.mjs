import fs from 'node:fs';

const failures=[];
const warnings=[];
const read=p=>fs.readFileSync(p,'utf8');

function requireText(file, text, label=file){
  const s=read(file);
  if(!s.includes(text)) failures.push(label);
}
function readJsonIfExists(file){
  if(!fs.existsSync(file)) return null;
  return JSON.parse(read(file));
}

const expectedCommit=(process.env.RELEASE_SHA||process.env.GITHUB_SHA||'local').trim();

requireText('docs/03-implementation/CROSS-DEVICE-HARDENING-CERTIFICATION-EVIDENCE.md','Certification ID: MTA-CDH-CERT-2026-09-26-01');
requireText('docs/03-implementation/CROSS-DEVICE-HARDENING-CERTIFICATION-EVIDENCE.md','Environment: controlled-nonprod / synthetic runtime');
requireText('docs/03-implementation/CROSS-DEVICE-HARDENING-CERTIFICATION-EVIDENCE.md','**Status:** CERTIFIED');

const kernel=read('docs/03-implementation/P9.13-KERNEL-CERTIFICATION-v1.0.md');
const kernelEvidence=read('docs/03-implementation/P9.13-KERNEL-CERTIFICATION-EVIDENCE.md');
const p913Certified=/P9\.13 KERNEL CERTIFICATION\s*=\s*CERTIFIED|KERNEL CERTIFICATION\s*=\s*CERTIFIED|Status:\s*CERTIFIED/i.test(kernel) && /MTA-P9\.13-CERT-2026-09-26-01/.test(kernelEvidence);
if(!p913Certified) failures.push('P9.13 Kernel Certification is not backed by certified evidence');

const runbook=read('docs/03-implementation/MTA-PRODUCTION-READINESS-RUNBOOK.md');
for(const x of [
  'P0 blockers = 0',
  'P1 blockers = 0',
  'Critical security findings = 0',
  'Critical data-integrity findings = 0',
  'Failed critical journeys = 0',
  'Unverified production dependencies = 0',
  'Production deployment gate = PASS',
  'Real user acceptance = PASS'
]) if(!runbook.includes(x)) failures.push('Missing production-readiness criterion: '+x);

const p10Kernel=read('web/mta-state-kernel-v1.js');
const p10Api=read('web/mta-production-api.js');
const p10Runtime=read('web/mta-app-runtime-full.js');
const p10Index=read('web/index.html');
const p10Edge=read('supabase/functions/mta-api/index.ts');
if(!p10Kernel.includes("mtaProductionApi.list('detainees')")) failures.push('P10 UI state kernel is not bound to production API');
if(!p10Kernel.includes('productionAccessAuthorized')||!p10Kernel.includes('livePostgresqlExecution')) failures.push('P10 runtime governance binding missing');
if(!p10Kernel.includes('refusing synthetic fallback')) failures.push('P10 fail-closed remote hydration contract missing');
if(!p10Api.includes("Idempotency-Key")) failures.push('P10 API adapter idempotency header missing');
if(!(p10Index.indexOf('/mta-production-api.js') < p10Index.indexOf('/mta-state-kernel-v1.js') && p10Index.indexOf('/mta-state-kernel-v1.js') < p10Index.indexOf('/mta-auth-ui.js'))) failures.push('P10 bootstrap order must be API -> state kernel -> auth UI');
if(!p10Runtime.includes('await window.MTADeteniStateKernel.ready()')) failures.push('P10 runtime does not await canonical binding hydration');
if(!p10Edge.includes('resource==="audit" && req.method==="GET"')) failures.push('P10 governed audit read contract missing');

const worker=read('worker-v11.js');
const requiredGovernance=[
  "dataMode:'SYNTHETIC_ONLY'",
  'ai:\'OFF\'',
  'migrationFreeze:true',
  'productionAccessAuthorized:false',
  'livePostgresqlExecution:false',
  'realDetaineeDataAllowed:false',
  'externalTransportAllowed:false',
  'durablePublicationAllowed:false'
];
for(const x of requiredGovernance) if(!worker.includes(x)) failures.push('Missing runtime governance invariant: '+x);

const deploy=read('.github/workflows/cloudflare-deploy.yml');
if(!deploy.includes('workflow_dispatch:')) failures.push('Production deployment is not manually gated');
if(!deploy.includes('wrangler deploy --config wrangler.toml --name "$DEPLOY_WORKER_NAME"')) failures.push('Production deployment target contract missing');
if(!deploy.includes('/api/health')) failures.push('Post-deploy health verification missing');

const staging=read('.github/workflows/cloudflare-staging.yml');
if(!staging.includes('dataMode!==\'SYNTHETIC_ONLY\'')) failures.push('Staging governance health assertion missing');

const uat=read('.github/workflows/cloudflare-staging-uat.yml');
for(const x of ['STAGING HEALTH: PASS','BROWSER SMOKE: PASS']) if(!uat.includes(x)) failures.push('Staging UAT contract missing: '+x);

const stagingEvidence=read('docs/03-implementation/STAGING-UAT-CERTIFICATION-EVIDENCE.md');
const stagingCertified=/Current decision:\s*CERTIFIED|Decision:\s*CERTIFIED/i.test(stagingEvidence) && /MTA-STAGING-UAT-CERT-2026-09-26-01/.test(stagingEvidence);
const stagingCommit=(stagingEvidence.match(/Release commit:\s*`?([0-9a-f]{40})`?/i)||[])[1]||null;
if(!stagingCommit) failures.push('Staging UAT evidence has no release commit');
else if(expectedCommit!=='local' && stagingCommit!==expectedCommit) failures.push(`Staging UAT evidence is stale: ${stagingCommit} != current release ${expectedCommit}`);

const productionEvidence=readJsonIfExists('docs/03-implementation/PRODUCTION-DEPLOYMENT-GATE-EVIDENCE.json');
const uatEvidence=readJsonIfExists('docs/03-implementation/REAL-UAT-EVIDENCE.json');

function evidencePass(e, label){
  if(!e) return false;
  if(e.status!=='PASS') { failures.push(`${label} status is not PASS`); return false; }
  if(expectedCommit!=='local' && e.commitSha!==expectedCommit) failures.push(`${label} is not bound to current release: ${e.commitSha||'missing'} != ${expectedCommit}`);
  return e.commitSha===expectedCommit || expectedCommit==='local';
}

const productionPass=evidencePass(productionEvidence,'Production deployment gate evidence');
const realUatPass=evidencePass(uatEvidence,'Real user acceptance evidence');

const blockers=[];
if(!p913Certified) blockers.push('P9.13 Kernel Certification is not backed by certified evidence.');
if(!stagingCertified) blockers.push('Production-like staging/UAT evidence is not certified.');
if(stagingCommit && expectedCommit!=='local' && stagingCommit!==expectedCommit) blockers.push(`Staging UAT evidence is bound to ${stagingCommit}, not current release ${expectedCommit}.`);
if(failures.length) blockers.push(...failures);
if(!productionPass) blockers.push('Production deployment gate has not been executed and passed on the current release candidate.');
if(!realUatPass) blockers.push('Real user acceptance has not been executed and passed on the current release candidate.');

const pass=expectedCommit!=='local' && blockers.length===0;
const result={
  certification:'PRODUCTION-READINESS-GATE-v2',
  commit:expectedCommit,
  environment:'controlled-nonprod',
  status:pass?'PASS':'NO_GO',
  readyForProduction:pass,
  blockers:[...new Set(blockers)],
  evidence:{
    staging:{status:stagingCertified?'CERTIFIED':'NOT_CERTIFIED',commitSha:stagingCommit},
    productionDeployment:{status:productionEvidence?.status||'NOT_EXECUTED',commitSha:productionEvidence?.commitSha||null},
    realUat:{status:uatEvidence?.status||'NOT_EXECUTED',commitSha:uatEvidence?.commitSha||null}
  },
  governance:{
    syntheticOnly:true,
    productionAccessAuthorized:false,
    migrationExecuted:false,
    aiEnabled:false
  },
  staticContractFailures:[...new Set(failures)],
  warnings
};
fs.mkdirSync('artifacts/mta-evidence',{recursive:true});
fs.writeFileSync('artifacts/mta-evidence/production-readiness-gate.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
process.exitCode=0;
