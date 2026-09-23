import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const admin=fs.readFileSync("web/admin-settings-v9.js","utf8");
const shell=fs.readFileSync("web/mta-unified-shell-v2.js","utf8");
const index=fs.readFileSync("web/index.html","utf8");

test("settings navigation handler is exposed before unified shell routing",()=>{
  assert.match(admin,/window\.p9openSettings=\(\)=>settings\(\)/);
  assert.match(index,/admin-settings-v9\.js/);
  assert.match(index,/mta-unified-shell-v2\.js/);
});

test("unified shell preserves administrator settings route",()=>{
  assert.match(shell,/v==='p9settings'&&typeof window\.p9openSettings==='function'/);
  assert.match(shell,/window\.p9openSettings\(\)/);
});

test("settings route is not left to legacy renderer",()=>{
  assert.doesNotMatch(shell,/if\(v==='p9settings'\)[^{}]*return originalShow/);
});

test("all navigation menus receive deterministic SVG icon contract",()=>{
  for (const view of [
    "dashboard","detainee","placement","movement","leave","documents","audit","p9settings",
    "monitor","ops-queue","qr-center","camera-scan","room-ops","reports"
  ]) assert.match(shell,new RegExp("['\\\"]"+view+"['\\\"]"));
  assert.match(shell,/NAV_ICONS=/);
  assert.match(shell,/function ensureNavIcon\(b\)/);
  assert.match(shell,/class="mta-nav-icon"/);
  assert.match(shell,/installNavIconStyle\(\)/);
});
