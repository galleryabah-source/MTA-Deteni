import { strict as assert } from "node:assert";
import fs from "node:fs";
const shell=fs.readFileSync("web/mta-unified-shell-v2.js","utf8");
const preview=fs.readFileSync("web/preview-v5.js","utf8");
assert.match(shell,/window\.mtaUnifiedAdvanceLeave=advanceLeaveCommand/);
assert.match(shell,/LEAVE_QR_REVOKE|REVOKE/);
assert.match(shell,/window\.mtaUnifiedResolve=resolve/);
assert.match(preview,/show\('p5ops'\)/);
console.log("F3_LEAVE_RETURN_ACTION PASS");
