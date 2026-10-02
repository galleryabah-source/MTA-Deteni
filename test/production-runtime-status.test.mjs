import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const runtime=fs.readFileSync("web/mta-app-runtime-full.js","utf8");
const index=fs.readFileSync("web/index.html","utf8");
const authUi=fs.readFileSync("web/mta-auth-ui.js","utf8");

test("production dashboard renders runtime status from canonical production adapter state",()=>{
  assert.match(runtime,/function runtimeContext\(\)/);
  assert.ok(runtime.includes("mtaProductionStateAdapter?.isProduction"));
  assert.ok(runtime.includes("database==='CONNECTED'"));
  assert.ok(runtime.includes("mode==='PRODUCTION'"));
  assert.ok(runtime.includes("runtimeContext().database"));
  assert.ok(runtime.includes("runtimeContext().mode"));
  assert.ok(runtime.includes("runtimeContext().ai"));
  assert.ok(runtime.includes("syncRuntimeChrome()"));
});

test("production chrome has no hardcoded Local synthetic runtime label",()=>{
  assert.doesNotMatch(index,/Local synthetic runtime/);
  assert.doesNotMatch(index,/Synthetic functional runtime · No operational detainee data/);
  assert.doesNotMatch(authUi,/Authentication boundary · AI OFF · Synthetic runtime/);
});

test("production boot hydrates canonical production state without blocking first paint",()=>{
  assert.match(runtime,/renderProductionBootFailure/);
  assert.match(runtime,/window\.mtaProductionStateAdapter\.hydrate\(\)\.then/);
  assert.match(runtime,/Production bootstrap is fail-closed and non-blocking/);
  assert.doesNotMatch(runtime,/if\(window\.mtaProductionStateAdapter\?\.isProduction\(\)\) await window\.mtaProductionStateAdapter\.hydrate\(\)/);
  assert.match(runtime,/if\(production\)[\s\S]*?return;/);
});
