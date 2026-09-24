import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("Phase 10 report evidence/output boundary is isolated",()=>{
 const s=readFileSync("web/daily-guard-report-v2.js","utf8");
 for(const marker of ["buildPrintDocument","REPORT_OUTPUT_BOUNDARY_INVALID","REPORT_OUTPUT_CONTAMINATION","mta-report-preview","@page{size:20in 11.25in;margin:0}"]) assert.ok(s.includes(marker),marker);
 assert.match(s,/window\.mtaDailyGuardReport=Object\.freeze\(\{[^}]*buildPrintDocument/);
});
