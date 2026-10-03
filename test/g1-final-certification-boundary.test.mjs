import assert from "node:assert/strict";
import fs from "node:fs";

const doc=fs.readFileSync("docs/G1_FINAL_CERTIFICATION_V1.md","utf8");
for(const marker of [
  "G1 = NOT CERTIFIED",
  "X2 — Import / Manual Procedure",
  "X3 — External Integration",
  "X4 — Privileged Writer / Credential Provenance",
  "X5 — Recovery Operator",
  "NID   = canonical operational identity",
  "code  = temporary compatibility CREATE input",
  "G2 replacement of the caller-supplied legacy code creation contract is **BLOCKED**",
  "drop or rename",
  "invent a legacy-code generator",
  "provision the production restore function"
]) assert.ok(doc.includes(marker),`Missing G1 certification marker: ${marker}`);

console.log("G1_FINAL_CERTIFICATION_BOUNDARY=PASS");
