import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("Phase 10 browser runtime evidence contract",()=>{
 const shell=readFileSync("web/mta-unified-shell-v2.js","utf8");
 const worker=readFileSync("worker-v11.js","utf8");
 for(const marker of ["mta:unified-ready","mtaUnifiedNavigationContractTest","mtaUnifiedMutationConsistencyContractTest","mtaUnifiedOfflineRecoveryContractTest","MTA_DETENI_INTEGRATION_SELF_TEST"]) assert.ok(shell.includes(marker),marker);
 for(const marker of ["MIGRATION_FREEZE","synthetic","/api/mta/"]) assert.ok(worker.includes(marker),marker);
});
test("Phase 10 runtime journey markers remain browser-addressable",()=>{
 const shell=readFileSync("web/mta-unified-shell-v2.js","utf8");
 for(const marker of ["camera-scan","qr-center","movement","reports","monitor","ops-queue"]) assert.ok(shell.includes(marker),marker);
});
