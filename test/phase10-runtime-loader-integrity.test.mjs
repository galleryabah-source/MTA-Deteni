import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("Phase 10 runtime loader prevents duplicate script injection",()=>{
 const s=readFileSync("web/mta-unified-shell-v2.js","utf8");
 assert.match(s,/script\[src="\+path\+"/);
 assert.match(s,/script\[src\^="\+path\+"\?/);
});
test("Phase 10 worker and unified shell remain synthetic-only",()=>{
 const s=readFileSync("worker-v11.js","utf8");
 assert.match(s,/migrationFreeze:true/);
 assert.match(s,/dataMode:'SYNTHETIC_ONLY'/);
});
