import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const runtime=fs.readFileSync("web/mta-app-runtime-full.js","utf8");
const index=fs.readFileSync("web/index.html","utf8");
const authUi=fs.readFileSync("web/mta-auth-ui.js","utf8");

test("production dashboard renders runtime status from canonical production adapter state",()=>{
  assert.match(runtime,/function runtimeContext()/);
  assert.match(runtime,/mtaProductionStateAdapter?.isProduction/);
  assert.match(runtime,/database==='CONNECTED'/);
  assert.match(runtime,/mode==='PRODUCTION'/);
  assert.match(runtime,/runtimeContext().database/);
  assert.match(runtime,/runtimeContext().mode/);
  assert.match(runtime,/runtimeContext().ai/);
  assert.match(runtime,/syncRuntimeChrome()/);
});

test("production chrome has no hardcoded Local synthetic runtime label",()=>{
  assert.doesNotMatch(index,/Local synthetic runtime/);
  assert.doesNotMatch(index,/Synthetic functional runtime · No operational detainee data/);
  assert.doesNotMatch(authUi,/Authentication boundary · AI OFF · Synthetic runtime/);
});

test("production boot hydrates canonical production state before dashboard render",()=>{
  assert.match(runtime,/await window\.mtaProductionStateAdapter\.hydrate\(\)/);
  assert.match(runtime,/syncRuntimeChrome\(\);\s*db=load\(\);\s*window\.__mtaAppBooted=true/);
});
