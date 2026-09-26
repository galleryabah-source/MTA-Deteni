import { strict as assert } from "node:assert";
import fs from "node:fs";
const preview=fs.readFileSync("web/preview-v5.js","utf8");
assert.match(preview,/window\.mtaUnifiedAdvanceLeave\(ensure\(\),id\)/);
assert.match(preview,/LEAVE_QR_REVOKE/);
assert.match(preview,/show\('p5ops'\)/);
console.log("F3_LEAVE_RETURN_ACTION PASS");
