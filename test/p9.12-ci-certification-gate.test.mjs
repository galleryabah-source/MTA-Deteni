import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const required=[
 "test/p9.7-transaction-idempotency.test.mjs",
 "test/p9.8-application-dispatcher-contract.test.mjs",
 "test/p9.9-private-storage-runtime-boundary.test.mjs",
 "test/p9.10-observability-hardening.test.mjs",
 "test/p9.11-unified-kernel-harness.test.mjs"
];

test("P9.12 certification manifest covers P9.7-P9.11",()=>{
 for(const path of required)assert.doesNotThrow(()=>readFileSync(path,"utf8"),path);
});

test("P9.12 governance freeze remains explicit",()=>{
 const docs=readFileSync("docs/p9.11-unified-kernel-harness.md","utf8");
 assert.match(docs,/MIGRATION_FREEZE=TRUE/);
});
