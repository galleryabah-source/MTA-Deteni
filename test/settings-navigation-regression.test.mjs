import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const admin=fs.readFileSync("web/admin-settings-v9.js","utf8");
const shell=fs.readFileSync("web/mta-unified-shell-v2.js","utf8");
const runtime=fs.readFileSync("web/mta-app-runtime-full.js","utf8");

test("settings navigation handler is exposed before unified shell routing",()=>{
  assert.match(admin,/window\.p9openSettings=\(\)=>settings\(\)/);
  assert.match(runtime,/admin-settings-v9\.js/);
  assert.match(runtime,/mta-unified-shell-v2\.js\?v=10/);
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
  ]) assert.ok(shell.includes(view+":") || shell.includes("\'"+view+"\'") || shell.includes('"'+view+'"'));
  assert.match(shell,/NAV_ICONS=/);
  assert.match(shell,/function ensureNavIcon\(b\)/);
  assert.match(shell,/class="mta-nav-icon"/);
  assert.match(shell,/installNavIconStyle\(\)/);
});

test("sidebar navigation is canonical and duplicate-free by source contract",()=>{
  const roomOps=fs.readFileSync("web/room-ops-v9.js","utf8");
  const preview5=fs.readFileSync("web/preview-v5.js","utf8");
  const preview6=fs.readFileSync("web/preview-v6.js","utf8");
  const desktop=fs.readFileSync("web/desktop-shell-v2.js","utf8");
  assert.doesNotMatch(roomOps,/id='p9rooms'|data-view='p9rooms'/);
  assert.doesNotMatch(preview5,/p5m.*Monitor.*p5monitor/);
  assert.doesNotMatch(preview6,/p6r.*Room Ops.*p6rooms/);
  assert.match(shell,/nav\('scan-center','Scan Center','scan'\)/);
  assert.match(shell,/nav\('leave-qr','Leave QR','leave'\)/);
  assert.match(shell,/nav\('room-ops','Room Ops','room'\)/);
  assert.match(desktop,/NAV_ORDER=\[/);
  assert.match(desktop,/groupNav\(nav\)/);
});
