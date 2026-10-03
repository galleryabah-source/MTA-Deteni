import assert from "node:assert/strict";
import fs from "node:fs";
const doc=fs.readFileSync("docs/G1_X2_IMPORT_MANUAL_PROCEDURE_CLOSURE_V1.md","utf8");
for(const term of [
"No dedicated operational detainee import implementation","SYNTHETIC_SEED","P9.7-DURABLE-v1",
"DEITANEE_INSERT / SUCCESS: 14","DEITANEE_UPDATE / SUCCESS: 4","G1-X2 = PARTIALLY CLOSED / EXTERNAL PROCEDURE UNVERIFIED",
"G1-X3 External Integration Closure","G1-X5 Recovery Operator Closure","G2 Legacy Code replacement remains blocked"
]) assert.ok(doc.includes(term),"Missing term: "+term);
console.log("G1-X2 IMPORT/MANUAL PROCEDURE CLOSURE BOUNDARY PASS");