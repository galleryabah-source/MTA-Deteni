import assert from "node:assert/strict";
import fs from "node:fs";

const doc=fs.readFileSync("docs/G1_X3_EXTERNAL_INTEGRATION_CLOSURE_V1.md","utf8");

for (const marker of [
  "G1-X3 = PARTIALLY CLOSED / EXTERNAL OPERATIONAL PROVENANCE UNVERIFIED",
  "No repository-owned webhook or callback receiver was identified",
  "No dedicated CSV/XLSX detainee importer",
  "INTERNAL_APPLICATION_DISPATCH",
  "G2 remains blocked",
  "G1-X5 Recovery Operator Closure"
]) {
  assert.ok(doc.includes(marker), `Missing G1-X3 evidence marker: ${marker}`);
}

assert.ok(doc.includes("CLOUDFLARE_API_TOKEN"));
assert.ok(doc.includes("SUPABASE_SERVICE_ROLE_KEY"));
assert.ok(doc.includes("2026-10-02 00:00–16:00 Asia/Jakarta"));
assert.ok(doc.includes("no POST/PATCH/DELETE detainee request was observed"));

console.log("G1_X3_EXTERNAL_INTEGRATION_CLOSURE=PASS");
