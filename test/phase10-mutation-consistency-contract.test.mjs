import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("Phase 10 mutation consistency contract is wired",()=>{
 const s=readFileSync("web/mta-unified-shell-v2.js","utf8");
 for(const marker of ["mutationConsistencyContractTest","MUTATION_DUPLICATE_BLOCKED","MUTATION_SINGLE_STATE","MUTATION_SINGLE_AUDIT","MUTATION_MONITOR_REFLECTS","MUTATION_QUEUE_REFLECTS"])assert.ok(s.includes(marker),marker);
});
