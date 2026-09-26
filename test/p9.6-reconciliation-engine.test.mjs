import test from "node:test";
import assert from "node:assert/strict";
import { buildReconciliationRows, deriveEffectivePolicies } from "../scripts/p9.6-reconciliation-engine.mjs";

test("effective policy state follows migration lifecycle and ignores replaced policies", () => {
  const sql = [
    "create policy legacy_write on public.items for all to authenticated using (true);",
    "drop policy if exists legacy_write on public.items;",
    "create policy insert_write on public.items for insert to authenticated with check (true);",
    "create policy update_write on public.items for update to authenticated using (true) with check (true);",
  ].join("\n");
  assert.deepEqual(deriveEffectivePolicies(sql), ["insert_write", "update_write"]);
});

test("constraint-backed PostgreSQL indexes are justified rather than EXTRA", () => {
  const rows = buildReconciliationRows(
    ["business_idx"],
    ["business_idx", "items_pkey", "items_code_key"],
    "index",
    {
      justifiedActual: ["items_pkey", "items_code_key"],
      justification: "postgresql-auto-index-for-primary-key-or-unique-constraint",
    },
  );
  assert.equal(rows.find((row) => row.object === "items_pkey")?.status, "MATCH");
  assert.equal(rows.find((row) => row.object === "items_code_key")?.status, "MATCH");
  assert.equal(rows.find((row) => row.object === "business_idx")?.status, "MATCH");
});

test("genuine unexplained index remains EXTRA", () => {
  const rows = buildReconciliationRows(["business_idx"], ["business_idx", "unapproved_idx"], "index");
  assert.equal(rows.find((row) => row.object === "unapproved_idx")?.status, "EXTRA");
});
