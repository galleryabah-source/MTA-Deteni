import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const ROOT=new URL("..",import.meta.url).pathname;
const read=p=>readFileSync(join(ROOT,p),"utf8");

test("compatibility strategy: NID remains canonical and code remains temporary",()=>{
  const s=read("docs/LEGACY_DETAINEE_CODE_CREATION_COMPATIBILITY_STRATEGY_V1.md");
  assert.match(s,/RETAIN TEMPORARY COMPATIBILITY INPUT/);
  assert.match(s,/NID\s*= canonical operational identity/);
  assert.match(s,/code\s*= legacy compatibility reference/);
  assert.match(s,/External provenance closure/);
  assert.match(s,/Physical retirement\s+BLOCKED/);
});

test("compatibility strategy: no legacy generator is introduced",()=>{
  const s=read("docs/LEGACY_DETAINEE_CODE_CREATION_COMPATIBILITY_STRATEGY_V1.md");
  assert.match(s,/must not invent a new legacy-code generator/i);
});

test("compatibility strategy: existing write boundary remains closed",()=>{
  const s=read("web/mta-domain-commands-v1.js");
  assert.match(s,/DETAINEE_CODE_IMMUTABLE/);
  assert.match(s,/Object\.assign\(x,\{name,nationality/);
});

test("compatibility strategy: API continues to reject legacy code mutation",()=>{
  const s=read("supabase/functions/mta-api/index.ts");
  assert.match(s,/DETAINEE_CODE_IMMUTABLE/);
  assert.match(s,/hasOwnProperty\.call\(body,"code"\)/);
});
