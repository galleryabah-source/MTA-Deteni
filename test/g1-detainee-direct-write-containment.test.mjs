import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const ROOT=new URL("..",import.meta.url).pathname;
const read=p=>readFileSync(join(ROOT,p),"utf8");

test("detainee direct-write containment revokes authenticated DML",()=>{
 const s=read("supabase/migrations/20261002160000_mta_detainee_direct_write_containment_v1.sql");
 assert.match(s,/revoke insert, update, delete on table public\.mta_detainees from authenticated;/i);
});

test("detainee containment preserves canonical service-role boundary",()=>{
 const s=read("supabase/migrations/20261002160000_mta_detainee_direct_write_containment_v1.sql");
 assert.match(s,/canonical service boundary/i);
 assert.match(s,/Production execution remains governed by the G1 gate/i);
});

test("detainee containment does not revoke authenticated read",()=>{
 const s=read("supabase/migrations/20261002160000_mta_detainee_direct_write_containment_v1.sql");
 assert.doesNotMatch(s,/revoke\s+select\b/i);
});
