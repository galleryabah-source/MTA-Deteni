import assert from "node:assert/strict";
import fs from "node:fs";

const doc=fs.readFileSync("docs/G1_X5_RECOVERY_OPERATOR_CLOSURE_V1.md","utf8");
const sql=fs.readFileSync("supabase/operations/mta_backup_restore_transaction_v1.sql","utf8");
const api=fs.readFileSync("supabase/functions/mta-api/index.ts","utf8");

for (const marker of [
  "G1-X5 = BLOCKED / RECOVERY OPERATOR PROVENANCE NOT CLOSED",
  "a named backup archive owner",
  "a named restore operator",
  "Privileged recovery credential custody",
  "production restore function is confirmed absent",
  "syntheticOnly = true",
  "completed production recovery rehearsal",
  "G2 remains blocked"
]) assert.ok(doc.includes(marker), `Missing X5 marker: ${marker}`);

assert.match(api,/resource==="backup-restore"&&req\.method==="POST"/);
assert.match(api,/role!=="OWNER"/);
assert.match(api,/mta_restore_backup_transaction/);
assert.match(sql,/security definer/);
assert.match(sql,/pg_advisory_xact_lock/);
assert.match(sql,/grant execute on function public\.mta_restore_backup_transaction[\s\S]*to service_role/);
assert.match(sql,/revoke execute on function public\.mta_restore_backup_transaction/);

console.log("G1_X5_RECOVERY_OPERATOR_CLOSURE=PASS");
