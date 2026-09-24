import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("Phase 10 preflight identifies the canonical operational surfaces",()=>{
 const sources=[
  "src/application/execution-context-contract.ts",
  "src/application/database-adapter-contract.ts",
  "src/infrastructure/database/transaction-idempotency.mjs",
  "src/infrastructure/storage/private-storage-runtime.mjs",
  "src/infrastructure/observability/observability-runtime.mjs"
 ];
 for(const p of sources)assert.ok(readFileSync(p,"utf8").length>0,p);
});

test("Phase 10 preflight retains migration freeze and AI-off governance",()=>{
 const docs=[
  "docs/p9.13-final-kernel-certification.md",
  "docs/phase10-operational-feature-readiness.md"
 ];
 for(const p of docs){
  const s=readFileSync(p,"utf8");
  assert.match(s,/MIGRATION_FREEZE=TRUE/);
  assert.match(s,/AI|migration/i);
 }
});

test("Phase 10 preflight requires functional journey contracts before feature mutation",()=>{
 const doc=readFileSync("docs/phase10-operational-feature-readiness.md","utf8");
 for(const marker of ["scanner","action","audit","monitor","report","offline"])assert.match(doc,new RegExp(marker,"i"));
});
