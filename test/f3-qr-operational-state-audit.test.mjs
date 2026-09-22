import { strict as assert } from "node:assert";
import fs from "node:fs";

const preview=fs.readFileSync("web/preview-v6.js","utf8");

assert.match(preview,/appendAudit=(d,a,t,i,r='SUCCESS')/);
assert.match(preview,/ROOM_QR_STATE_CHANGED/);
assert.match(preview,/QR_ROOM_STATE_CHANGE/);
assert.match(preview,/ROOM_STATE_CHANGE/);
assert.match(preview,/LEAVE_QR_ISSUED/);
assert.match(preview,/LEAVE_QR_STATE_ACTIVE/);
assert.match(preview,/d.events=d.events||[]/);
assert.match(preview,/put(d);toast('Room QR state/);
assert.match(preview,/put(d);toast('QR izin diterbitkan/);

console.log("F3_QR_OPERATIONAL_STATE_AUDIT PASS");
