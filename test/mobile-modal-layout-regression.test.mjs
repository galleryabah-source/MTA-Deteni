import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../web/index.html",import.meta.url),"utf8");

assert.match(html,/\.modal\{z-index:110;align-items:flex-start/);
assert.match(html,/Keep the existing smartphone bottom navigation untouched/);
assert.match(html,/\.dialog\{position:relative;z-index:121/);
assert.match(html,/\.dialog \.actions\{position:sticky;bottom:-16px/);
assert.match(html,/\.dialog \.actions \.btn\{min-height:44px/);
assert.match(html,/env\(safe-area-inset-bottom\)/);

console.log("mobile-modal-layout-regression: PASS");
