import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../web/mta-unified-shell-v2.js",import.meta.url),"utf8");

assert.match(source,/function action\(kind,id\)/);
assert.ok(
  source.includes("mtaUnifiedOpenMovement(\\'") &&
  source.includes("'+esc(id)+'"),
  "QR action must concatenate the resolved detainee id into the movement handler"
);
assert.doesNotMatch(
  source,
  /mtaUnifiedOpenMovement\([^\n]*\$\{esc\(id\)\}/
);

console.log("QR action handoff regression: PASS");
