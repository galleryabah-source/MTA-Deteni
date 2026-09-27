import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const bootstrap=fs.readFileSync("web/mta-app-runtime.js","utf8");
const full=fs.readFileSync("web/mta-app-runtime-full.js","utf8");

test("bootstrap dashboard does not present synthetic operational KPI data",()=>{
  assert.match(bootstrap,/Runtime sedang menginisialisasi/);
  assert.doesNotMatch(bootstrap,/Deteni Aktif.*<strong>2<\/strong>/);
  assert.doesNotMatch(bootstrap,/Penempatan.*<strong>2<\/strong>/);
  assert.doesNotMatch(bootstrap,/Data Mode.*SYNTHETIC/);
  assert.doesNotMatch(bootstrap,/Database.*NOT CONNECTED/);
});

test("full runtime is the canonical operational renderer",()=>{
  assert.match(full,/function dashboard\(v\)/);
  assert.match(full,/db\.detainees\.filter/);
  assert.match(full,/runtimeContext\(\)\.mode/);
  assert.match(full,/runtimeContext\(\)\.database/);
});

test("authenticated full runtime uses current production adapter cache version",()=>{
  assert.match(full,/mta-production-state-adapter-v1\.js\?v=2/);
});
