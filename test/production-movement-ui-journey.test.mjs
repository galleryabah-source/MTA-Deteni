import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const movement=fs.readFileSync("web/movement-v9.js","utf8");
const adapter=fs.readFileSync("web/mta-production-state-adapter-v1.js","utf8");
test("production movement UI uses canonical MOVE_DETAINEE command",()=>{
 assert.match(movement,/mtaProductionStateAdapter\.executeMovement/);
 assert.match(movement,/await window\.mtaProductionStateAdapter\.executeMovement/);
 assert.match(movement,/movementId/); assert.match(movement,/placementId/); assert.match(movement,/auditEventId/);
 assert.match(movement,/IDEMPOTENCY_CONFLICT/); assert.match(movement,/ROOM_CAPACITY_EXCEEDED/);
});
test("production adapter sends authenticated idempotent movement request and reloads canonical state",()=>{
 assert.match(adapter,/Authorization:'Bearer '\+s\.access_token/); assert.match(adapter,/X-Request-Id/);
 assert.match(adapter,/X-Correlation-Id/); assert.match(adapter,/Idempotency-Key/);
 assert.match(adapter,/command:'MOVE_DETAINEE'/); assert.match(adapter,/await hydrate\(\)/); assert.match(adapter,/lastCommand/);
 assert.match(adapter,/readOnly:false/);
});
