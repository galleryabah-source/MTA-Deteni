import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shell=fs.readFileSync("web/desktop-shell-v2.js","utf8");
const runtime=fs.readFileSync("web/mta-app-runtime-full.js","utf8");

test("desktop runtime strip is not hardcoded synthetic",()=>{
  assert.doesNotMatch(shell,/Runtime:<\/strong> Local Synthetic · AI OFF · Database NOT CONNECTED/);
  assert.match(shell,/mtaProductionStateAdapter/);
  assert.match(shell,/__mtaRuntimeStatus/);
  assert.match(shell,/dataset\.runtimeMode/);
  assert.match(shell,/dataset\.database/);
});

test("canonical runtime broadcasts status to desktop chrome",()=>{
  assert.match(runtime,/CustomEvent\('mta-runtime-status'/);
  assert.match(runtime,/desktop-shell-v2\.js\?v=8/);
});
