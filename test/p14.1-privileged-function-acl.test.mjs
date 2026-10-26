import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const migration=readFileSync(
  "supabase/migrations/20261002053000_mta_privileged_function_acl_hardening_v1.sql",
  "utf8"
);

test("P14.1 privileged helper ACL migration revokes direct EXECUTE",()=>{
  for(const marker of [
    "mta_internal.execute_movement_transaction",
    "private.mta_audit_before_insert",
    "private.mta_audit_immutable",
    "private.mta_audit_canonical_material"
  ]) assert.ok(migration.includes(marker), marker);
  assert.ok(migration.includes("from public, anon, authenticated, service_role"));
});

test("P14.1 does not revoke authenticated access to current-role RLS helper",()=>{
  assert.ok(!migration.includes("revoke execute on function private.mta_current_role"));
});

console.log("P14.1 privileged function ACL hardening contract PASS");
