import { strict as assert } from "node:assert";
import fs from "node:fs";

const preview = fs.readFileSync("web/preview-v6.js", "utf8");
assert.match(preview, /function p6dailyGuardSnapshot/);
assert.match(preview, /DGR-v1/);
assert.match(preview, /DAILY_GUARD_REPORT_VALIDATION_FAILED/);
assert.match(preview, /DAILY_GUARD_REPORT_VALIDATE/);
assert.match(preview, /DAILY_GUARD_REPORT_RENDER/);
assert.match(preview, /DAILY_GUARD_REPORT_EXPORT/);
assert.match(preview, /DAILY_GUARD_REPORT_PRINT/);
assert.match(preview, /Movement IN/);
assert.match(preview, /Kejadian terbuka/);
assert.match(preview, /synthetic-operational-runtime/);

console.log("F4_DAILY_GUARD_REPORT_BROWSER_CONTRACT PASS");
