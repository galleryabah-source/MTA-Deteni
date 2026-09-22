import assert from "node:assert/strict";
import fs from "node:fs";

const ui=fs.readFileSync("web/mta-auth-ui.js","utf8");
const html=fs.readFileSync("web/index.html","utf8");
const auth=fs.readFileSync("web/mta-auth.js","utf8");

for(const marker of [
  "mtaAuthGate","mta-auth-guest","mta-auth-pending",
  "OWNER","ADMIN","EDITOR","REVIEWER","AUDITOR",
  "RBAC_ROLE_NOT_ASSIGNED","mtaProductionApi.get('me')",
  "mta-rbac-ready","mtaRbacLogout",
  "Akses publik dan pendaftaran mandiri dinonaktifkan"
]) assert.ok(ui.includes(marker),"missing RBAC login marker: "+marker);

assert.equal(html.includes("mta-auth-ui.js"),true,"login UI must be loaded");
assert.equal(html.includes('type="module" src="/mta-auth.js"'),true,"Supabase auth adapter must be loaded");
assert.ok(auth.includes("signIn(email,password)"),"password login contract missing");
assert.ok(auth.includes("onAuthStateChange"),"session state listener missing");

const roleMatrix=ui.match(/const RBAC=Object\.freeze\(\{([\s\S]*?)\n  \}\);/);
assert.ok(roleMatrix,"RBAC matrix must be explicit");
for(const role of ["OWNER","ADMIN","EDITOR","REVIEWER","AUDITOR"])assert.ok(roleMatrix[1].includes(role),role+" missing from matrix");

assert.ok(ui.includes("b.hidden=!ok"),"unauthorized navigation must be hidden");
assert.ok(ui.includes("backup.hidden=!['OWNER','ADMIN'].includes(role)"),"backup must be role-gated");
assert.ok(ui.includes("restore.hidden=!['OWNER','ADMIN'].includes(role)"),"restore must be role-gated");

console.log("AUTH_RBAC_LOGIN_GATE PASS");
