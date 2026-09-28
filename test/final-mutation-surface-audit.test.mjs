import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

const domain=["detainees","placements","movements","leaves","documents","blocks","rooms","audit"];
const productionWriters=[
  "web/mta-app-runtime-full.js",
  "web/admin-settings-v9.js",
  "web/room-ops-v9.js",
  "web/movement-v9.js",
  "web/detainee-detail-v1.js",
  "web/detainee-statistics-v1.js",
  "web/data-statistics-report-v1.js",
  "web/master-room-guard-v10.js"
];

test("CMO-05/06 final mutation surface audit: production UI has no direct domain array mutation",()=>{
  const forbidden=new RegExp(
    "\\b(?:db|state|data)\\.(?:"+domain.join("|")+")(?:\\[[^\\]]+\\])?(?:\\.(?:push|unshift|splice|shift|pop)\\s*\\(|\\s*=)",
    "g"
  );
  const findings=[];
  for(const file of productionWriters){
    const source=fs.readFileSync(file,"utf8");
    for(const match of source.matchAll(forbidden))findings.push({file,index:match.index,match:match[0]});
  }
  assert.deepEqual(findings,[],"Direct domain-state mutation detected outside canonical command boundary");
});

test("CMO-05 canonical production mutation surface is centralized",()=>{
  const commands=fs.readFileSync("web/mta-domain-commands-v2.js","utf8");
  const adapter=fs.readFileSync("web/mta-production-state-adapter-v1.js","utf8");
  for(const resource of ["placements","leaves","documents","blocks","rooms"])
    assert.match(commands,new RegExp("productionResourceMutation\\('"+resource+"'"),resource+" lacks canonical production mutation seam");
  assert.match(commands,/productionDetaineeMutation/);
  assert.match(adapter,/async function mutateDetainee/);
  assert.match(adapter,/async function mutateResource\(resource,operation/);
  assert.match(adapter,/async function executeMovement/);
  assert.match(adapter,/request\(resource,\{method,id/);
});

test("CMO-05 runtime production path does not persist through synthetic save",()=>{
  const runtime=fs.readFileSync("web/mta-app-runtime-full.js","utf8");
  const productionBlocks=[...runtime.matchAll(/if\(window\.mtaProductionStateAdapter\?\.isProduction\?\.\(\)\)\{/g)];
  assert.ok(productionBlocks.length>0,"No production mutation branches detected");
  for(const block of productionBlocks){
    const start=block.index??0;
    const tail=runtime.slice(start,start+1800);
    const elseIndex=tail.search(/}else(?:\s*if)?\s*\{/);
    const productionBranch=elseIndex>=0?tail.slice(0,elseIndex):tail;
    assert.doesNotMatch(productionBranch,/save\(\)/,"Browser save() must remain outside the production mutation branch");
  }
});

test("CMO-05/06 mutation ownership evidence files exist",()=>{
  for(const file of [
    "test/canonical-mutation-ownership.test.mjs",
    "test/canonical-remaining-mutation-ownership.test.mjs",
    "test/detainee-canonical-persistence-regression.test.mjs",
    "test/production-browser-storage-sweep.test.mjs",
    "test/server-side-backup-restore-contract.test.mjs"
  ])assert.ok(fs.existsSync(file),file+" missing");
});

console.log("CMO-05/06 final mutation surface audit PASS"); // CI-GATE-2026-09-28
