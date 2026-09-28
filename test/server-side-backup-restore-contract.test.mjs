import assert from "node:assert/strict";
import fs from "node:fs";

const api=fs.readFileSync("supabase/functions/mta-api/index.ts","utf8");
const adapter=fs.readFileSync("web/mta-production-state-adapter-v1.js","utf8");
const commands=fs.readFileSync("web/mta-domain-commands-v2.js","utf8");
const runtime=fs.readFileSync("web/mta-app-runtime-full.js","utf8");
const index=fs.readFileSync("web/index.html","utf8");
const sql=fs.readFileSync("supabase/operations/mta_backup_restore_transaction_v1.sql","utf8");

assert.match(api,/resource==="backup"&&req\.method==="GET"/);
assert.match(api,/resource==="backup-restore"&&req\.method==="POST"/);
assert.match(api,/mta_restore_backup_transaction/);
assert.match(api,/RBAC_BACKUP_RESTORE_DENIED/);
assert.match(api,/BACKUP_FINGERPRINT_MISMATCH/);
assert.match(api,/resource==="audit-event"/);
assert.match(api,/const TABLES=new Set\(\["detainees","placements","movements","leaves","documents","blocks","rooms","audit","audit-event"\]\)/);

assert.match(adapter,/async function createBackup\(\)/);
assert.match(adapter,/request\('backup',\{method:'GET'\}\)/);
assert.match(adapter,/async function restoreBackup\(snapshot\)/);
assert.match(adapter,/request\('backup-restore',\{method:'POST'/);

assert.match(commands,/async function restoreBackup\(s,x\)/);
assert.match(commands,/mtaProductionStateAdapter\?\.restoreBackup\(x\)/);

assert.match(runtime,/mtaProductionStateAdapter\?\.createBackup\(\)/);
assert.match(runtime,/await window\.MTADeteniDomainCommandsV2\?\.restoreBackup\(x\)/);
assert.match(runtime,/mtaProductionStateAdapter\?\.isProduction/);
assert.match(index,/mta-production-state-adapter-v1\.js\?v=6/);
assert.match(index,/mta-domain-commands-v2\.js\?v=5/);

assert.match(sql,/create or replace function public\.mta_restore_backup_transaction/);
assert.match(sql,/language plpgsql/);
assert.match(sql,/security definer/);
assert.match(sql,/pg_advisory_xact_lock/);
assert.match(sql,/jsonb_populate_recordset/);
assert.match(sql,/delete from public\.mta_placements/);
assert.match(sql,/delete from public\.mta_detainees/);
assert.match(sql,/insert into public\.mta_audit_events/);
assert.match(sql,/revoke execute on function public\.mta_restore_backup_transaction/);
assert.match(sql,/grant execute on function public\.mta_restore_backup_transaction[\s\S]*to service_role/);

console.log("CMO-01 server-side backup/restore contract PASS");
