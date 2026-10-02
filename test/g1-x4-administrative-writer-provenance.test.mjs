import assert from "node:assert/strict";
import fs from "node:fs";

const doc=fs.readFileSync("docs/G1_X4_ADMINISTRATIVE_WRITER_PROVENANCE_AUDIT_V1.md","utf8");

assert.match(doc,/postgres/);
assert.match(doc,/supabase_admin/);
assert.match(doc,/mta_internal\.execute_movement_transaction/);
assert.match(doc,/pg_cron\/pg_net\/pgmq/);
assert.match(doc,/G1 certification: BLOCKED/);

console.log("G1-X4 ADMINISTRATIVE WRITER PROVENANCE BOUNDARY PASS");
