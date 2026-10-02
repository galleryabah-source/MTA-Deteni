import assert from "node:assert/strict";
import fs from "node:fs";

const doc=fs.readFileSync("docs/G1_X4_EXTERNAL_OPERATIONAL_CREDENTIAL_CLOSURE_V1.md","utf8");

[
  "CLOUDFLARE_API_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "mta-api v24",
  "mta-outbox-dispatcher v2",
  "mta-login v1",
  "pg_cron",
  "pg_net",
  "pgmq",
  "0 rows",
  "PARTIALLY CLOSED",
  "G1-X2",
  "G1-X3",
  "G1-X5",
  "G2 Legacy Code replacement remains blocked"
].forEach(term=>assert.ok(doc.includes(term), "Missing audit term: "+term));

assert.match(doc,/GitHub secret values.*not exposed/i);
assert.match(doc,/No privilege is revoked or rotated/i);

console.log("G1-X4 EXTERNAL/OPERATIONAL CREDENTIAL CLOSURE BOUNDARY PASS");
