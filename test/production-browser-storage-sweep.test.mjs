import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const ROOT="web";
function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...walk(full));
    else if(/\.(?:js|html)$/.test(entry.name))out.push(full);
  }
  return out;
}
const files=walk(ROOT);
const source=files.map(file=>({file,text:fs.readFileSync(file,"utf8")}));

const browserWriterPatterns=[
  /localStorage\.(?:setItem|removeItem|clear)\s*\(/g,
  /sessionStorage\.(?:setItem|removeItem|clear)\s*\(/g,
  /indexedDB\./g,
  /caches\.(?:open|delete|keys)\s*\(/g,
  /document\.cookie\s*=/g
];

const allowedLocalStorageWriters=new Set([
  "web/mta-state-kernel-v1.js",
  "web/preview-v10.js"
]);
const allowedSessionStorageWriters=new Set([
  "web/mta-unified-shell-v2.js",
  "web/admin-settings-v9.js"
]);

test("CMO-06 production browser storage writer sweep is explicit and fail-closed",()=>{
  const unknown=[];
  for(const {file,text} of source){
    const rel=file.replaceAll(path.sep,"/");
    const local=[...text.matchAll(browserWriterPatterns[0])];
    if(local.length && !allowedLocalStorageWriters.has(rel))unknown.push({type:"localStorage",file:rel,count:local.length});
    const session=[...text.matchAll(browserWriterPatterns[1])];
    if(session.length && !allowedSessionStorageWriters.has(rel))unknown.push({type:"sessionStorage",file:rel,count:session.length});
    for(const pattern of browserWriterPatterns.slice(2)){
      if(pattern.test(text))unknown.push({type:pattern.source,file:rel,count:1});
      pattern.lastIndex=0;
    }
  }
  assert.deepEqual(unknown,[],"New browser persistence writer detected outside an explicitly reviewed allowlist");
});

test("CMO-06 production state kernel hard-blocks browser persistence",()=>{
  const kernel=fs.readFileSync("web/mta-state-kernel-v1.js","utf8");
  assert.match(kernel,/if\(isProductionHost\(\)\)throw new Error\('PRODUCTION_BROWSER_STORAGE_FORBIDDEN'\)/);
  assert.match(kernel,/if\(isProductionHost\(\)\)return clone\(window\.__mtaProductionState\|\|\{\}\)/);
});

test("CMO-06 allowed localStorage writers are non-domain persistence only",()=>{
  const kernel=fs.readFileSync("web/mta-state-kernel-v1.js","utf8");
  const preview=fs.readFileSync("web/preview-v10.js","utf8");
  assert.match(kernel,/const KEY='mta-deteni-demo-v2'/);
  assert.match(kernel,/const BRANDING_KEY='mta-deteni-branding-v1'/);
  assert.match(preview,/const KEY='mta-deteni-nav-collapsed'/);
  assert.doesNotMatch(preview,/mta-deteni-demo-v2/);
});

test("CMO-06 production UI does not directly persist domain state",()=>{
  for(const file of [
    "web/mta-app-runtime-full.js",
    "web/admin-settings-v9.js",
    "web/room-ops-v9.js",
    "web/movement-v9.js",
    "web/detainee-detail-v1.js",
    "web/detainee-statistics-v1.js",
    "web/data-statistics-report-v1.js"
  ]){
    const text=fs.readFileSync(file,"utf8");
    assert.doesNotMatch(text,/localStorage\.(?:setItem|removeItem|clear)\s*\(/,file+" contains a direct localStorage writer");
  }
});

console.log("CMO-06 browser storage writer sweep PASS");
