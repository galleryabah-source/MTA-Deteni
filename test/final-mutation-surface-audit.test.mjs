import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
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

test("CMO-05/06 final mutation audit: production UI has no direct domain array mutation",()=>{
  const forbidden=new RegExp(
    "\\b(?:db|state|data)\\.(?:"+domain.join("|")+")(?:\\[[^\\]]+\\])?(?:\\.(?:push|unshift|splice|shift|pop)\\s*\\(|\\s*=)",
    "g"
  );
  const findings=[];
  for(const file of productionWriters){
    const text=fs.readFileSync(file,"utf8");
    for(const match of text.matchAll(forbidden)){
      findings.push({file,index:match.index,match:match[0]});
    }
  }
  assert.deepEqual(findings,[],"Direct domain-state mutation detected outside canonical command boundary");
});

test("CMO-05 canonical production mutation surface is centralized",()=>{
  const commands=fs.readFileSync("web/mta-domain-commands-v2.js","utf8");
  const adapter=fs.readFileSync("web/mta-production-state-adapter-v1.js","utf8");
  for(const resource of ["placements","leaves","documents","blocks","rooms"]){
    assert.match(commands,new RegExp("productionResourceMutation\\\\('"+resource+"'"),resource+" lacks canonical production mutation seam");
  }
  assert.match(commands,/productionDetaineeMutation/);
  assert.match(adapter,/async function mutateDetainee/);
  assert.match(adapter,/async function mutateResource\\(resource,operation/);
  assert.match(adapter,/async function executeMovement/);
  assert.match(adapter,/request\\(resource,\\{method,id/);
