import { strict as assert } from "node:assert";
import fs from "node:fs";

const movement = fs.readFileSync("web/movement-v9.js", "utf8");

assert.match(movement, /const appendAudit=\(d,a,t,i,r='SUCCESS'\)/);
assert.match(movement, /d\.events=d\.events\|\|\[\]/);
assert.match(movement, /MOVEMENT_CREATED/);
assert.match(movement, /appendAudit\(d,'MOVEMENT_CREATE','MOVEMENT',movement\.id\)/);
assert.match(movement, /appendAudit\(d,'PLACEMENT_ASSIGN','PLACEMENT',p\.id\)/);
assert.match(movement, /d\.movements\.unshift\(movement\);d\.placements\.unshift\(p\)/);
assert.match(movement, /put\(d\);toast\('Perpindahan kamar tersimpan\.'/);

console.log("F3_MOVEMENT_STATE_EVENT_AUDIT_CONTINUITY PASS");
