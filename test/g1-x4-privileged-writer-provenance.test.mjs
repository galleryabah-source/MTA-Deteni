import assert from "node:assert/strict";
import fs from "node:fs";

const sql=fs.readFileSync(
  "supabase/migrations/20261002223000_g1_x4_privileged_movement_execute_containment_v1.sql",
  "utf8",
);

assert.match(sql,/revoke execute on function mta_internal\.execute_movement_transaction/);
assert.match(sql,/from public, anon, authenticated/);
assert.match(sql,/grant execute on function mta_internal\.execute_movement_transaction[\s\S]*to service_role/);

const dispatcher=fs.readFileSync(
  "supabase/functions/mta-outbox-dispatcher/index.ts",
  "utf8",
);
assert.match(dispatcher,/SUPABASE_SERVICE_ROLE_KEY/);

const api=fs.readFileSync("supabase/functions/mta-api/index.ts","utf8");
assert.match(api,/mta_execute_idempotent_mutation/);
assert.match(api,/mta_execute_movement_transaction/);
assert.match(api,/SUPABASE_SERVICE_ROLE_KEY/);

console.log("G1-X4 PRIVILEGED WRITER PROVENANCE BOUNDARY PASS");
