import assert from "node:assert/strict";
import fs from "node:fs";

const doc=fs.readFileSync("docs/G1_X4_PRIVILEGED_CREDENTIAL_SURFACE_AUDIT_V1.md","utf8");

assert.match(doc,/mta-api/);
assert.match(doc,/mta-outbox-dispatcher/);
assert.match(doc,/mta-login/);
assert.match(doc,/external\/scheduled\/operator/);
assert.match(doc,/postgres administrative writer provenance/);
assert.match(doc,/G1 certification = BLOCKED/);

console.log("G1-X4 PRIVILEGED CREDENTIAL SURFACE AUDIT BOUNDARY PASS");
