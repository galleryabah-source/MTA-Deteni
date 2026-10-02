import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../web/mta-unified-shell-v2.js",import.meta.url),"utf8");

assert.match(source,/function action\(kind,id\)/);
assert.match(
  source,
  /onclick="mtaUnifiedOpenMovement\(\\'\+esc\(id\)\+\\'\)"/
);
assert.doesNotMatch(
  source,
  /onclick="mtaUnifiedOpenMovement\(\\'\$\{esc\(id\)\}\\'\)"/
);

console.log("QR action handoff regression: PASS");
