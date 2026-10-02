import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const auth=fs.readFileSync("web/mta-auth-ui.js","utf8");
const runtime=fs.readFileSync("web/mta-app-runtime-full.js","utf8");
const index=fs.readFileSync("web/index.html","utf8");

test("authentication shell never presents synthetic operational dashboard",()=>{
  assert.doesNotMatch(auth,/Data Mode.*SYNTHETIC/);
  assert.doesNotMatch(auth,/<div class="label">Data Mode<\/div><div class="value"[^>]*>SYNTHETIC/);
  assert.match(auth,/Canonical runtime sedang memuat state operasional/);
});

test("canonical runtime can take over after authenticated shell readiness",()=>{
  assert.match(runtime,/const authReady=document\.body\.classList\.contains\('mta-auth-ready'\)/);
  assert.match(runtime,/if\(!authReady\|\|!authenticated\)return/);
  assert.match(runtime,/void window\.mtaProductionStateAdapter\.hydrate\(\)\.then\(/);
  assert.match(runtime,/if\(production\)\{[\s\S]*?return;/);
  assert.doesNotMatch(runtime,/if\(production\)\{[\s\S]*?await window\.mtaProductionStateAdapter\.hydrate\(\)/);
});

test("bootstrap asset is cache-busted",()=>{
  assert.match(index,/mta-app-runtime\.js\?v=12/);
});
