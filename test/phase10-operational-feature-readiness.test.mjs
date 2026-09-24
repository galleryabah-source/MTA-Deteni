import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("P10 readiness gate preserves kernel certification prerequisites",()=>{
 const required=[
  "test/p9.13-final-kernel-certification.test.mjs",
  "docs/p9.13-final-kernel-certification.md",
  "src/application/execution-context-contract.ts",
  "src/infrastructure/observability/observability-runtime.mjs",
  "src/infrastructure/storage/private-storage-runtime.mjs"
 ];
 for(const f of required)assert.ok(readFileSync(f,"utf8").length>0,f);
});

test("P10 readiness is not a migration approval",()=>{
 const doc=readFileSync("docs/p9.13-final-kernel-certification.md","utf8");
 assert.match(doc,/not a production deployment approval/i);
 assert.match(doc,/migration/i);
});
