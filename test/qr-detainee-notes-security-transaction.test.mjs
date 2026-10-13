import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("restricted health records are isolated by API role and scope", async () => {
  const api = await read("supabase/functions/mta-api/index.ts");
  assert.match(api, /kind==="HEALTH"&&!new Set\(\["OWNER","ADMIN","HEALTHCARE"\]\)\.has\(role\)/);
  assert.match(api, /mta_profile_scopes/);
  assert.match(api, /RBAC_HEALTH_RECORD_ACCESS_DENIED/);
  assert.match(api, /DETAINEE_SCOPE_DENIED/);
});

test("note persistence remains fail-closed until the server release gate is enabled", async () => {
  const api = await read("supabase/functions/mta-api/index.ts");
  assert.match(api, /const productionWritesEnabled=\(\)=>Deno\.env\.get\("MTA_PRODUCTION_WRITES_ENABLED"\)==="true"/);
  assert.match(api, /if\(!productionWritesEnabled\(\)\) return json\(req,\{ok:false,error:"DETAINEE_NOTES_WRITE_LOCKED"\},423/);
});

test("note, audit, outbox, and idempotency response share one SQL transaction", async () => {
  const migration = await read("supabase/migrations/20261013090000_mta_detainee_activity_health_records_v1.sql");
  assert.match(migration, /(?:^|\n)begin;/);
  assert.match(migration, /insert into public\.mta_detainee_activity_notes/);
  assert.match(migration, /insert into public\.mta_detainee_health_records/);
  assert.match(migration, /insert into public\.mta_audit_events/);
  assert.match(migration, /insert into mta_internal\.outbox_events/);
  assert.match(migration, /update mta_internal\.idempotency_keys set response=v_response/);
  assert.match(migration, /revoke all on function public\.mta_create_detainee_note_transaction[\s\S]*?from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.mta_create_detainee_note_transaction[\s\S]*?to service_role/);
  assert.match(migration, /commit;\s*$/);
});

test("health-record table is not directly readable or writable by client roles", async () => {
  const migration = await read("supabase/migrations/20261013090000_mta_detainee_activity_health_records_v1.sql");
  assert.match(migration, /alter table public\.mta_detainee_health_records enable row level security/);
  assert.match(migration, /revoke all on public\.mta_detainee_health_records from anon, authenticated/);
  assert.match(migration, /grant select, insert on public\.mta_detainee_health_records to service_role/);
});

test("database failures are surfaced; the QR note path does not persist synthetic fallback records", async () => {
  const adapter = await read("web/mta-production-state-adapter-v1.js");
  const shell = await read("web/mta-unified-shell-v2.js");
  assert.match(adapter, /if\(!isProduction\(\)\)throw new Error\('PRODUCTION_DATABASE_REQUIRED'\)/);
  assert.match(adapter, /return request\('detainee-notes'/);
  assert.match(shell, /Penyimpanan catatan dinonaktifkan; tidak ada data synthetic yang ditulis/);
  assert.match(shell, /Gagal menyimpan catatan:/);
  assert.match(shell, /Gagal menyimpan rekam kesehatan:/);
});

test("SQL transaction rejects NULL note kind and subtype values explicitly", async () => {
  const migration = await read("supabase/migrations/20261013090000_mta_detainee_activity_health_records_v1.sql");
  assert.match(migration, /p_note_kind is null or p_note_kind not in \('ACTIVITY','HEALTH'\)/);
  assert.match(migration, /p_note_type is null or p_note_type not in \('ACTIVITY','CONDITION','INCIDENT'\)/);
  assert.match(migration, /p_exam_type is null or p_exam_type not in \('OBSERVATION','EXAMINATION','FOLLOW_UP','REFERRAL'\)/);
});
