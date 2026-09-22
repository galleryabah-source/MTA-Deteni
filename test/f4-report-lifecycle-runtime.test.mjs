import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

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
  "verifyAndRecord",
  "registerDownload",
  "VERIFY_INTEGRITY",
]) assert.ok(adapter.includes(marker), "missing adapter marker: "+marker);

assert.ok(preview.includes("DAILY_GUARD_REPORT_PRINT"), "missing print audit action");
assert.ok(preview.includes("DAILY_GUARD_REPORT_DOWNLOAD"), "missing download audit action");
assert.ok(preview.includes("F4_DOWNLOAD_REQUIRES_FINAL"), "missing final-only download guard");
assert.ok(preview.includes("F4_FINALIZE_REQUIRES_APPROVAL"), "missing approval-gated finalize guard");
assert.ok(preview.includes("finalArtifactId"), "missing final artifact gate");
assert.ok(preview.includes("integrity(l,entry.snapshot,l.finalArtifactId)"), "integrity must bind final artifact");
assert.ok(preview.includes("entry.lifecycle=verified.report"), "verification event must persist");
assert.ok(preview.includes("MTAF4Lifecycle.registerDownload"), "download lifecycle event must persist");
assert.ok(preview.includes("prompt('Alasan perubahan/revisi:')"));

const context = vm.createContext({ window: {}, crypto: webcrypto, TextEncoder, setTimeout });
vm.runInContext(adapter, context);
const api = context.window.MTAF4Lifecycle;
assert.equal(api.VERSION, "F4-DGR-LIFECYCLE-v1");
let report = api.create("DGR-RUNTIME-001");
for (const target of ["VALIDATED","GENERATED","IN_REVIEW","APPROVED"]) report = api.transition(report, target);
const artifactId = "ART-DGR-RUNTIME-001";
report = { ...report, finalArtifactId: artifactId };
report = { ...report, integrityHash: await api.integrity(report, { reportDate: "2026-09-22" }, artifactId) };
report = api.transition(report, "FINAL");
const observed = await api.integrity(report, { reportDate: "2026-09-22" }, artifactId);
assert.equal(observed, report.integrityHash, "artifact-bound integrity must verify after FINAL transition");
const verified = api.verifyAndRecord(report, observed);
assert.equal(verified.valid, true);
report = verified.report;
report = api.registerDownload(report);
assert.equal(report.events.at(-1).action, "DOWNLOAD");
assert.equal(api.validate(report), true);
console.log("F4_REPORT_LIFECYCLE_RUNTIME PASS");
