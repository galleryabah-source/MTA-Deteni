import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("detainee activity and health records use the production API and canonical DB transaction", async () => {
  const api = await read("supabase/functions/mta-api/index.ts");
  const migration = await read("supabase/migrations/20261013090000_mta_detainee_activity_health_records_v1.sql");
  const adapter = await read("web/mta-production-state-adapter-v1.js");
  const shell = await read("web/mta-unified-shell-v2.js");

  assert.match(api, /resource==="detainee-notes"/);
  assert.match(api, /RBAC_HEALTH_RECORD_ACCESS_DENIED/);
  assert.match(api, /DNOTE_HEALTHCARE_ROLE_REQUIRED/);
  assert.match(api, /mta_create_detainee_note_transaction/);
  assert.match(api, /const columns=kind==="HEALTH"/);
  assert.match(api, /\.select\(columns\)/, "note history reads must use explicit least-privilege projections, not select(*)");
  assert.doesNotMatch(api, /admin\.from\(table\)\.select\(\"\*\"\)\.eq\(\"detainee_id\",targetId\)/);
  assert.match(migration, /create table if not exists public\.mta_detainee_activity_notes/);
  assert.match(migration, /create table if not exists public\.mta_detainee_health_records/);
  assert.match(migration, /mta_profile_scopes/);
  assert.match(migration, /mta_audit_events/);
  assert.match(migration, /mta_internal\.outbox_events/);
  assert.match(migration, /mta_internal\.idempotency_keys/);
  assert.match(migration, /'actor_user_id',p_actor_user_id,'created_at',v_now/);
  assert.match(migration, /'examiner_user_id',p_actor_user_id,'created_at',v_now/);
  assert.match(migration, /v_response := jsonb_build_object\('ok',true,'replayed',false,'noteKind',p_note_kind,'row',v_record\)/, "RPC response must expose only the application record contract");
  assert.doesNotMatch(migration, /v_response := jsonb_build_object\([^;]*(?:auditEventId|outboxEventId|requestId|correlationId)/, "internal audit, outbox, and correlation metadata must not be returned to clients");
  assert.doesNotMatch(migration, /returning id,to_jsonb\(mta_detainee_(?:activity_notes|health_records)\) into v_record_id,v_record/, "create responses must not serialize internal table columns");
  assert.match(adapter, /getDetaineeNotes/);
  assert.match(adapter, /createDetaineeNote/);
  assert.match(shell, /Simpan ke Database/);
  assert.match(shell, /Simpan Rekam Kesehatan/);
  assert.match(shell, /DB_WRITE_FAILED/);
  assert.doesNotMatch(shell, /detaineeNotes\.unshift/);
});

test("health records are restricted and no direct browser database write is introduced", async () => {
  const migration = await read("supabase/migrations/20261013090000_mta_detainee_activity_health_records_v1.sql");
  const shell = await read("web/mta-unified-shell-v2.js");
  assert.match(migration, /role not in \('OWNER','ADMIN','EDITOR','HEALTHCARE'\)/);
  assert.match(migration, /revoke all on public\.mta_detainee_health_records from (?:public, )?anon, authenticated/);
  assert.match(shell, /getDetaineeNotes\(id,'HEALTH'\)/);
  assert.match(shell, /createDetaineeNote\(\{detaineeId:id,kind:'HEALTH'/);
});
