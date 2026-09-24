import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const files=[
 "src/application/execution-context-contract.ts",
 "src/application/database-adapter-contract.ts",
 "src/infrastructure/database/transaction-idempotency.mjs",
 "src/infrastructure/storage/private-storage-runtime.mjs",
 "src/infrastructure/observability/observability-runtime.mjs",
 "test/p9.11-unified-kernel-harness.test.mjs"
];

test("P9.13 final kernel certification surface is present",()=>{
 for(const file of files){
  const source=readFileSync(file,"utf8");
  assert.ok(source.length>0,file);
 }
});

test("P9.13 governance invariants remain locked",()=>{
 const p9docs=[
  "docs/p9.10-observability-hardening.md",
  "docs/p9.11-unified-kernel-harness.md",
  "docs/p9.12-ci-certification-gate.md"
 ];
 for(const file of p9docs)assert.match(readFileSync(file,"utf8"),/MIGRATION_FREEZE=TRUE/);
});

test("P9.13 no direct postgres dependency is introduced",()=>{
 const pkg=JSON.parse(readFileSync("package.json","utf8"));
 const deps={...(pkg.dependencies||{}),...(pkg.devDependencies||{})};
 assert.equal(Boolean(deps.pg),false);
 assert.equal(Boolean(deps.postgres),false);
});
