import { spawnSync } from "node:child_process";
import fs from "node:fs";

const checks=[
  ["K1","Runtime","node --check worker-v11.js"],
  ["K2","Configuration","node test/cloudflare-health-governance.test.mjs"],
  ["K3","Authentication","node --test test/production-auth-rbac-api.test.mjs"],
  ["K4","Authorization","npx tsx test/authorization-adversarial-certification.test.ts"],
  ["K5","Audit","node test/p9.5-audit-integrity.test.mjs"],
  ["K6","Database Adapter","npx tsx test/p9.6-database-adapter.test.ts test/p9.6-db-negative-contract.test.ts"],
  ["K7","Transaction + Idempotency","npx tsx test/transaction-idempotency-boundary.test.ts test/p10.456-463-idempotency.test.ts test/p11-961-1088-transaction-command.test.ts"],
  ["K8","Outbox","npx tsx test/outbox-runtime-contract.test.ts"],
  ["K9","Private Storage","npx tsx test/p9.13-private-storage-certification.test.ts"],
  ["K10","Observability","npx tsx test/observability-certification.test.ts test/observability-context-continuity.test.ts"],
  ["K11","Test Harness","npx tsx test/p9-kernel-certification.test.ts"],
  ["K12","CI Quality Gate","npx tsx test/p9-ci-certification.test.ts"],
  ["AI-OFF","AI Independence","npx tsx test/ai-off-deterministic-fallback.test.ts"],
];

const results=[];
for(const [id,name,command] of checks){
  const [exe,...args]=command.split(" ");
  const r=spawnSync(exe,args,{encoding:"utf8",env:{...process.env,MTA_EXECUTION_ENV:"controlled-nonprod",AI_ENABLED:"false"},timeout:180000});
  results.push({
    id,name,command,
    status:r.status===0?"PASS":"FAIL",
    exitCode:typeof r.status==="number"?r.status:-1,
    signal:r.signal||null,
    stdout:(r.stdout||"").slice(-3000),
    stderr:(r.stderr||"").slice(-3000)
  });
}

const worker=fs.readFileSync("worker-v11.js","utf8");
const governance={
  syntheticOnly:worker.includes("dataMode:'SYNTHETIC_ONLY'"),
  productionAccessAuthorized:worker.includes("productionAccessAuthorized:false"),
  livePostgresqlExecution:worker.includes("livePostgresqlExecution:false"),
  realDetaineeDataAllowed:worker.includes("realDetaineeDataAllowed:false"),
  migrationFreeze:worker.includes("migrationFreeze:true"),
  aiOff:worker.includes("ai:'OFF'"),
};
const governancePass=Object.values(governance).every(Boolean);
const mandatoryPass=results.every(x=>x.status==="PASS");
const certified=mandatoryPass&&governancePass;

const evidence={
  certificationId:"MTA-P9.13-CERT-2026-09-26-01",
  certification:"P9.13-KERNEL-CERTIFICATION-v1",
  commitSha:process.env.GITHUB_SHA||"local",
  environment:"controlled-nonprod",
  status:certified?"CERTIFIED":"NOT_CERTIFIED",
  controls:Object.fromEntries(results.map(x=>[x.id,x.status])),
  results,
  governance,
  migrationExecuted:false,
  productionAccessAuthorized:false,
  aiEnabled:false,
  syntheticOnly:true,
  finalDecision:certified?"CERTIFIED":"BLOCKED",
  timestamp:new Date().toISOString()
};
fs.mkdirSync("artifacts/mta-evidence",{recursive:true});
fs.writeFileSync("artifacts/mta-evidence/p9.13-kernel-certification.json",JSON.stringify(evidence,null,2));
console.log(JSON.stringify({status:evidence.status,controls:evidence.controls,governance:evidence.governance},null,2));
if(!certified) process.exitCode=1;
