import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const sql=fs.readFileSync("supabase/migrations/20260923041000_mta_audit_hash_chain_v1.sql","utf8");

test("P9.5 audit hash chain declares canonical version and verifier",()=>{
  assert.match(sql,/AUDIT-HASH-v1/);
  assert.match(sql,/mta_audit_canonical_material/);
  assert.match(sql,/mta_audit_before_insert_hash/);
  assert.match(sql,/mta_verify_audit_integrity/);
});

test("P9.5 audit history is immutable",()=>{
  assert.match(sql,/AUDIT_IMMUTABLE_HISTORY/);
  assert.match(sql,/mta_audit_immutable_update/);
  assert.match(sql,/mta_audit_immutable_delete/);
});

test("P9.5 verifier is service-role only",()=>{
  assert.match(sql,/revoke all on function public\.mta_verify_audit_integrity\(\) from public,anon,authenticated/);
  assert.match(sql,/grant execute on function public\.mta_verify_audit_integrity\(\) to service_role/);
});
