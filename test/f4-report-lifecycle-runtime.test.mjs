import assert from "node:assert/strict";
import fs from "node:fs";

const preview = fs.readFileSync("web/preview-v6.js","utf8");
const adapter = fs.readFileSync("web/f4-report-lifecycle-runtime.js","utf8");

for (const marker of [
  "f4LoadReport",
  "f4Action",
  "window.p6f4Action",
  "DAILY_GUARD_REPORT_VERIFY_INTEGRITY",
  "DAILY_GUARD_REPORT_DOWNLOAD",
]) assert.ok(preview.includes(marker), "missing runtime marker: "+marker);

for (const marker of [
  "F4_REPORT_LIFECYCLE-v1",
  "DRAFT",
  "VALIDATED",
  "GENERATED",
  "IN_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "FINAL",
  "REV-001",
  "REV-",
  "SHA-256",
]) assert.ok(adapter.includes(marker), "missing adapter marker: "+marker);

assert.match(preview, /if\(l\.status==='FINAL'\|\|!l\.finalArtifactId\)\{audit\('DAILY_GUARD_REPORT_PRINT'/);
assert.match(preview, /if\(l\.status!=='FINAL'\|\|!l\.finalArtifactId\)throw new Error\('F4_DOWNLOAD_REQUIRES_FINAL'\)/);
assert.match(preview, /if\(l\.status!=='APPROVED'\)throw new Error\('F4_FINALIZE_REQUIRES_APPROVAL'\)/);
assert.ok(preview.includes("prompt('Alasan perubahan/revisi:')"));
console.log("F4_REPORT_LIFECYCLE_RUNTIME PASS");
