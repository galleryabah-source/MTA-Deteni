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
  "F4-DGR-LIFECYCLE-v1",
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

assert.ok(preview.includes("DAILY_GUARD_REPORT_PRINT"), "missing print audit action");
assert.ok(preview.includes("DAILY_GUARD_REPORT_DOWNLOAD"), "missing download audit action");
assert.ok(preview.includes("F4_DOWNLOAD_REQUIRES_FINAL"), "missing final-only download guard");
assert.ok(preview.includes("F4_FINALIZE_REQUIRES_APPROVAL"), "missing approval-gated finalize guard");
assert.ok(preview.includes("finalArtifactId"), "missing final artifact gate");
assert.ok(preview.includes("prompt('Alasan perubahan/revisi:')"));

console.log("F4_REPORT_LIFECYCLE_RUNTIME PASS");
