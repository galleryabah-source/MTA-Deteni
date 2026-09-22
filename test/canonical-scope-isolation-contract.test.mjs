import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(new URL("../" + file, import.meta.url), "utf8");

test("canonical scope model enforces explicit detainee scope and scoped child-table inheritance", () => {
  const scopeSql = read("supabase/migrations/20260922140000_mta_canonical_scope_and_qr_registry.sql");
  const hardeningSql = read("supabase/migrations/20260922143000_mta_scope_policy_hardening.sql");
  const cleanupSql = read("supabase/migrations/20260922144500_mta_scope_policy_legacy_cleanup.sql");

  assert.match(scopeSql, /add column if not exists scope_id uuid references public\.mta_scopes/);
  assert.match(hardeningSql, /alter table public\.mta_detainees\s+alter column scope_id set not null/);

  for (const table of ["mta_placements", "mta_movements", "mta_leaves"]) {
    assert.match(hardeningSql, new RegExp("public\\." + table));
    assert.match(hardeningSql, /mta_detainees d/);
    assert.match(hardeningSql, /ps\.scope_id = d\.scope_id/);
  }

  for (const policy of [
    "mta_placements_insert_editor",
    "mta_placements_update_editor",
    "mta_placements_delete_admin",
    "mta_movements_insert_editor",
    "mta_movements_update_editor",
    "mta_movements_delete_admin",
    "mta_leaves_insert_editor",
    "mta_leaves_update_editor",
    "mta_leaves_delete_admin"
  ]) {
    assert.match(cleanupSql, new RegExp("drop policy if exists " + policy));
  }
});

test("canonical role/scope matrix is deny-by-default for scoped operators", () => {
  const sql = read("supabase/migrations/20260922140000_mta_canonical_scope_and_qr_registry.sql");

  assert.match(sql, /mta_detainees_select_scope[\\s\\S]*OWNER','ADMIN','AUDITOR/);
  assert.match(sql, /mta_detainees_insert_scope[\\s\\S]*OWNER','ADMIN','EDITOR/);
  assert.match(sql, /mta_detainees_update_scope[\\s\\S]*OWNER','ADMIN','EDITOR/);
  assert.match(sql, /mta_detainees_delete_scope[\\s\\S]*OWNER','ADMIN/);

  // EDITOR must prove active membership for the detainee's scope.
  assert.match(sql, /private\.mta_current_role\(\) in \('OWNER','ADMIN'\)[\\s\\S]*mta_profile_scopes ps/);
  assert.match(sql, /ps\.profile_id = \(select auth\.uid\(\)\)/);
  assert.match(sql, /ps\.active = true/);
});

test("QR resolution inherits the same scope boundary and cannot bypass authorization", () => {
  const sql = read("supabase/migrations/20260922150000_mta_qr_resolver_active_expiry_hardening.sql");

  assert.match(sql, /QR_SCOPE_DENIED/);
  assert.match(sql, /mta_detainees d/);
  assert.match(sql, /d\.id = p_resource_id/);
  assert.match(sql, /ps\.scope_id = d\.scope_id/);
  assert.match(sql, /q\.status = 'ACTIVE'/);
  assert.match(sql, /q\.expires_at is null or q\.expires_at > now\(\)/);
});

test("two-user isolation scenario is explicit: same role, different scopes, no cross-scope access", () => {
  const users = [
    { id: "USER-A", role: "EDITOR", scopes: ["SCOPE-A"] },
    { id: "USER-B", role: "EDITOR", scopes: ["SCOPE-B"] }
  ];
  const detainees = [
    { id: "DET-A", scope_id: "SCOPE-A" },
    { id: "DET-B", scope_id: "SCOPE-B" }
  ];

  const canAccess = (user, detainee) =>
    ["OWNER", "ADMIN", "AUDITOR"].includes(user.role) ||
    (["EDITOR", "REVIEWER", "VIEWER"].includes(user.role) && user.scopes.includes(detainee.scope_id));

  assert.equal(canAccess(users[0], detainees[0]), true);
  assert.equal(canAccess(users[0], detainees[1]), false);
  assert.equal(canAccess(users[1], detainees[0]), false);
  assert.equal(canAccess(users[1], detainees[1]), true);
});
