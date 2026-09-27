import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migration=fs.readFileSync("supabase/migrations/20260927123000_mta_transactional_movement_v1.sql","utf8");
const edge=fs.readFileSync("supabase/functions/mta-api/index.ts","utf8");

test("P11 movement transaction is one canonical database command",()=>{
  assert.match(migration,/execute_movement_transaction/);
  assert.match(migration,/for update/);
  assert.match(migration,/mta_movements/);
  assert.match(migration,/mta_placements/);
  assert.match(migration,/mta_audit_events/);
  assert.match(migration,/outbox_events/);
  assert.match(migration,/idempotency_keys/);
  assert.match(migration,/P11_ROOM_CAPACITY_EXCEEDED/);
  assert.match(migration,/P11_ROOM_SCOPE_MISMATCH/);
  assert.match(migration,/P11_SAME_ROOM/);
});

test("P11 production API exposes explicit MOVE_DETAINEE command",()=>{
  assert.match(edge,/resource==="movements" && body\?\.command==="MOVE_DETAINEE"/);
  assert.match(edge,/mta_execute_movement_transaction/);
  assert.match(edge,/P11_IDEMPOTENCY_CONFLICT/);
  assert.match(edge,/ROOM_CAPACITY_EXCEEDED/);
});
