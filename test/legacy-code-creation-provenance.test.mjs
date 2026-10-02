import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const ROOT=new URL("..",import.meta.url).pathname;
const read=p=>readFileSync(join(ROOT,p),"utf8");

test("legacy code provenance: UI is an explicit compatibility input",()=>{
  const s=read("web/mta-app-runtime-full.js");
  assert.match(s,/Kode Legacy \(compatibility\)/);
  assert.match(s,/name="code"/);
});

test("legacy code provenance: domain create consumes caller code, not a generator",()=>{
  const s=read("web/mta-domain-commands-v1.js");
  assert.match(s,/const d=state\|\|\{\},code=String\(options\.code\|\|''\)/);
  assert.match(s,/DETAINEE_CODE_EXISTS/);
  assert.doesNotMatch(s,/nextval|mta_detainee_nid_seq|generate.*code/i);
});

test("legacy code provenance: production adapter retains code only on create",()=>{
  const s=read("web/mta-production-state-adapter-v1.js");
  assert.match(s,/operation==='create'/);
  assert.match(s,/clean\.code=String\(code/);
  assert.match(s,/operation==='update'/);
});

test("legacy code provenance: API does not assign a legacy code generator",()=>{
  const s=read("supabase/functions/mta-api/index.ts");
  assert.match(s,/resource==="detainees"/);
  assert.match(s,/req\.method==="POST"/);
  assert.doesNotMatch(s,/mta_detainee_code_seq|assign.*legacy.*code|generate.*legacy.*code/i);
});

test("legacy code provenance: backup restore preserves compatibility payload",()=>{
  const s=read("supabase/functions/mta-api/index.ts");
  assert.match(s,/select\("\*"\)/);
  assert.match(s,/mta_restore_backup_transaction/);
});
