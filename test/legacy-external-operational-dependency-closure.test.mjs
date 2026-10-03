import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
const ROOT=new URL("..",import.meta.url).pathname;
const read=p=>readFileSync(join(ROOT,p),"utf8");

test("G1 must not falsely certify external closure",()=>{
 const s=read("docs/LEGACY_EXTERNAL_OPERATIONAL_DEPENDENCY_CLOSURE_V1.md");
 assert.match(s,/G1 CERTIFICATION\s+BLOCKED/);
 for(const x of ["Import/manual closure","External integration closure","DB writer closure","Recovery operator closure"]) {
   assert.match(s,new RegExp(x+"\\s+UNVERIFIED"));
 }
});

test("G1 retains compatibility safety boundary",()=>{
 const s=read("docs/LEGACY_EXTERNAL_OPERATIONAL_DEPENDENCY_CLOSURE_V1.md");
 assert.match(s,/retain temporary legacy `code` CREATE compatibility/i);
 assert.match(s,/do not invent a legacy generator/i);
 assert.match(s,/do not remove `code` from the production schema/i);
});

test("G1 defines X1-X5 closure evidence",()=>{
 const s=read("docs/LEGACY_EXTERNAL_OPERATIONAL_DEPENDENCY_CLOSURE_V1.md");
 for(const x of ["X1 — Production caller inventory","X2 — Import/manual procedure attestation","X3 — Integration inventory","X4 — Database access inventory","X5 — Recovery inventory"]) {
   assert.ok(s.includes(x), "missing "+x);
 }
});

test("G1 does not equate Git absence with operational absence",()=>{
 const s=read("docs/LEGACY_EXTERNAL_OPERATIONAL_DEPENDENCY_CLOSURE_V1.md");
 assert.match(s,/Git search != proof of all operational consumers/);
});