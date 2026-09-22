import { strict as assert } from "node:assert";
import fs from "node:fs";
const p5=fs.readFileSync("web/preview-v5.js","utf8"); const p6=fs.readFileSync("web/preview-v6.js","utf8"); const mv=fs.readFileSync("web/movement-v9.js","utf8");
assert.match(p5,/resourceId\]\?\.token===token/); assert.match(p5,/mta:\/\/leave\//); assert.match(p5,/QR token tidak aktif/); assert.match(p5,/LEAVE_RETURNED/); assert.match(p5,/returnedAt=/); assert.match(p5,/appendAudit\(d,'LEAVE_QR_REVOKE'/);
assert.match(mv,/MOVEMENT_CREATED/); assert.match(mv,/appendAudit\(d,'MOVEMENT_CREATE'/); assert.match(mv,/appendAudit\(d,'PLACEMENT_ASSIGN'/);
assert.match(p6,/ROOM_QR_STATE_CHANGED/); assert.match(p6,/LEAVE_QR_ISSUED/); assert.match(p6,/LEAVE_QR_STATE_ACTIVE/); assert.match(p6,/QR token tidak aktif/);
console.log("F3_FINAL_CLOSURE_HARDENING PASS");
