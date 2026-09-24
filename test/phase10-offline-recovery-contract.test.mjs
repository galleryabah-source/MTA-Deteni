import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("Phase 10 offline recovery contract is wired",()=>{
 const s=readFileSync("web/mta-unified-shell-v2.js","utf8");
 for(const marker of ["offlineRecoveryContractTest","OFFLINE_QUEUE_API","OFFLINE_INDEXEDDB_BOUNDARY","OFFLINE_DUPLICATE_RECONCILIATION","OFFLINE_INTERRUPTION_CAPTURE","OFFLINE_RECONNECT_SCOPE","OFFLINE_RECONCILIATION_RECEIPT"]) assert.ok(s.includes(marker),marker);
});
