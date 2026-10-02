import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../web/mta-unified-shell-v2.js",import.meta.url),"utf8");
const actionStart=source.indexOf("function action(kind,id)");
assert.notEqual(actionStart,-1,"canonical QR action function must exist");

const actionEnd=source.indexOf("\nfunction findPlacement",actionStart);
assert.notEqual(actionEnd,-1,"QR action function boundary must remain identifiable");

const actionSource=source.slice(actionStart,actionEnd);

assert.ok(
  actionSource.includes("mtaUnifiedOpenMovement(\\'") &&
  actionSource.includes("'+esc(id)+'"),
  "QR action must concatenate the resolved detainee id into the movement handler"
);
assert.doesNotMatch(
  actionSource,
  /mtaUnifiedOpenMovement\([^\n]*\$\{esc\(id\)\}/
);

console.log("QR action handoff regression: PASS");
