import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const ROOT=new URL("..",import.meta.url).pathname;
const read=p=>readFileSync(join(ROOT,p),"utf8");

test("legacy code write boundary: domain update cannot mutate code",()=>{
  const s=read("web/mta-domain-commands-v1.js");
  assert.match(s,/DETAINEE_CODE_IMMUTABLE/);
  assert.match(s,/const code=String\(x\.code\|\|''\)\.trim\(\),name=/);
  assert.doesNotMatch(s,/Object\.assign\(x,\{code,/);
});

test("legacy code write boundary: production adapter only sends code on create",()=>{
  const s=read("web/mta-production-state-adapter-v1.js");
  assert.match(s,/operation==='create'/);
  assert.match(s,/clean\.code=String\(code/);
  assert.match(s,/DETAINEE_CODE_IMMUTABLE/);
  assert.match(s,/operation==='update'/);
});

test("legacy code write boundary: UI edit no longer submits code",()=>{
  const s=read("web/mta-app-runtime-full.js");
  assert.match(s,/existing\?await command\.updateDetainee\(db,\{id:existing\.id,name,/);
});

test("legacy code write boundary: API rejects detainee code mutation",()=>{
  const s=read("supabase/functions/mta-api/index.ts");
  assert.match(s,/DETAINEE_CODE_IMMUTABLE/);
  assert.match(s,/hasOwnProperty\.call\(body,"code"\)/);
});
