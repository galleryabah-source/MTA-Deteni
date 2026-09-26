import fs from 'node:fs';

const failures=[];
const warnings=[];
const read=p=>fs.readFileSync(p,'utf8');

function requireText(file, text, label=file){
  const s=read(file);
  if(!s.includes(text)) failures.push(label);
}
function json(file){return JSON.parse(read(file));}

requireText('docs/03-implementation/CROSS-DEVICE-HARDENING-CERTIFICATION-EVIDENCE.md','Certification ID: MTA-CDH-CERT-2026-09-26-01');
requireText('docs/03-implementation/CROSS-DEVICE-HARDENING-CERTIFICATION-EVIDENCE.md','Environment: controlled-nonprod / synthetic runtime');

const kernel=read('docs/03-implementation/P9.13-KERNEL-CERTIFICATION-v1.0.md');
if(!/P9\.13 EXECUTION\s*=\s*NOT STARTED/.test(kernel)) warnings.push('P9.13 status document changed; inspect current certification state');
if(!/KERNEL CERTIFICATION\s*=\s*NOT STARTED/.test(kernel)) warnings.push('Kernel certification status document changed; inspect current certification state');

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

const result={
  certification:'PRODUCTION-READINESS-GATE-v1',
  commit:process.env.GITHUB_SHA||'local',
  environment:'controlled-nonprod',
  status:'NO_GO',
  readyForProduction:false,
  blockers:[
    'P9.13 Kernel Certification is documented as NOT STARTED.',
    'Production deployment gate has not been executed and passed on the current release candidate.',
    'Real user acceptance has not been executed and passed on the current release candidate.',
    'Production-like staging/UAT evidence is not present as an executed certification artifact on this gate.'
  ],
  governance:{
    syntheticOnly:true,
    productionAccessAuthorized:false,
    migrationExecuted:false,
    aiEnabled:false
  },
  staticContractFailures:failures,
  warnings
};
fs.mkdirSync('artifacts/mta-evidence',{recursive:true});
fs.writeFileSync('artifacts/mta-evidence/production-readiness-gate.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
process.exitCode=0;
