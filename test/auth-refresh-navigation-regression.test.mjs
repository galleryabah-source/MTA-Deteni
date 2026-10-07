import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const auth=fs.readFileSync("web/mta-auth.js","utf8");
const authUi=fs.readFileSync("web/mta-auth-ui.js","utf8");
const shell=fs.readFileSync("web/mta-unified-shell-v2.js","utf8");
const index=fs.readFileSync("web/index.html","utf8");

test("auth session is configured for persisted browser hydration",()=>{
  assert.match(auth,/persistSession:true/);
  assert.match(auth,/autoRefreshToken:true/);
  assert.match(auth,/storageKey:'mta-deteni-auth-session'/);
  assert.match(auth,/storage:window\.localStorage/);
  assert.match(auth,/for\(let attempt=0;attempt<8;attempt\+\+\)/);
  assert.match(auth,/pendingAuthSession\|\|null/);
  assert.match(auth,/INITIAL_SESSION\/null entirely inside the hydration boundary/);
});

test("initial login gate is visible until authenticated hydration completes",()=>{
  assert.match(index,/id="mtaAuthGate"[^>]*style="display:flex"/);
  assert.match(authUi,/gate\.style\.display='none'/);
  assert.match(authUi,/gate\.style\.removeProperty\('display'\)/);
});

test("auth UI does not treat unresolved refresh hydration as logout",()=>{
  assert.match(authUi,/if\(!resolved\)\{/);
  assert.match(authUi,/document\.body\.classList\.add\('mta-auth-locked'\)/);
  assert.match(authUi,/Keep the authenticated shell hidden while Supabase restores the persisted\s*\/\/\s*session/);
});

test("last operational view is restored after hard refresh",()=>{
  assert.match(shell,/const ROUTE_KEY='mta-deteni-route-v1'/);
  assert.match(shell,/sessionStorage\.getItem\(ROUTE_KEY\)/);
  assert.match(shell,/sessionStorage\.setItem\(ROUTE_KEY,JSON\.stringify\(\{view:String\(v\),id:id\|\|null\}\)\)/);
  assert.match(shell,/const route=window\.__mtaUnifiedReadRoute\?\.\(\)\|\|\{view:window\.__mtaUnifiedCurrentView\|\|'dashboard',id:null\}/);
});

test("refresh fix is cache-busted through the authenticated runtime chain",()=>{
  assert.match(index,/mta-auth-ui\.js\?v=10/);
  assert.match(index,/mta-app-runtime\.js\?v=13/);
  assert.match(index,/mta-app-runtime-full\.js\?v=25/);
  assert.match(index,/data-mta-operational-runtime="static"/);
  assert.match(fs.readFileSync("web/mta-app-runtime-full.js","utf8"),/mta-unified-shell-v2\.js\?v=15/);
});
