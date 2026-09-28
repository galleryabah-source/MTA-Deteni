import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read=p=>readFileSync(p,"utf8");

test("H5 leave creation has one canonical mutation owner",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  const commands=read("web/mta-domain-commands-v2.js");
  const start=runtime.indexOf("function addLeave(){");
  const end=runtime.indexOf("function appendLocalAudit",start);
  const block=runtime.slice(start,end);
  assert.match(block,/MTADeteniDomainCommandsV2\.createLeave/);
  assert.doesNotMatch(block,/db\.leaves\.unshift\(/);
  assert.match(commands,/function createLeave\(s,o=\{\}\)/);
  assert.match(commands,/LEAVE_CREATE/);
});

test("H6 room QR lifecycle has one canonical mutation owner",()=>{
  const roomOps=read("web/room-ops-v9.js");
  const preview=read("web/preview-v6.js");
  const commands=read("web/mta-domain-commands-v2.js");
  assert.match(roomOps,/MTADeteniDomainCommandsV2\.roomQrState/);
  assert.match(preview,/MTADeteniDomainCommandsV2\.roomQrState/);
  assert.match(preview,/MTADeteniDomainCommandsV2\.issueLeaveQr/);
  assert.match(commands,/function roomQrState\(s,id,nextState\)/);
  assert.match(commands,/function issueLeaveQr\(s,id\)/);
  assert.match(commands,/function revokeLeaveQr\(s,id\)/);
  assert.doesNotMatch(preview,/q\.status=next;x\.status=next/);
});

test("H7 admin master mutations delegate to canonical domain commands",()=>{
  const admin=read("web/admin-settings-v9.js");
  const commands=read("web/mta-domain-commands-v2.js");
  for(const marker of [
    "updateAi","updateBranding","uploadBranding","updateSystem",
    "catalogCreate","catalogRemove","createBlock","updateBlock","createRoom","updateRoom"
  ]) assert.match(admin,new RegExp("MTADeteniDomainCommandsV2\\?\\."+marker));
  for(const marker of [
    "function updateAi(","function updateBranding(","function uploadBranding(","function updateSystem(",
    "function catalogCreate(","function catalogRemove(","function createBlock(","function updateBlock(","function createRoom(","function updateRoom("
  ]) assert.match(commands,new RegExp(marker.replace(/[()]/g,"\\$&")));
  const actionSurface=admin.slice(admin.indexOf("window.p9saveAI=()=>"));
  assert.doesNotMatch(actionSurface,/d\.blocks\.push\(/);
  assert.doesNotMatch(actionSurface,/d\.rooms\.push\(/);
});

test("H8 canonical mutation module is wired into runtime",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  assert.match(runtime,/mta-domain-commands-v2\.js\?v=5/);
});

test("H9 document lifecycle and backup restore use canonical domain commands",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  const commands=read("web/mta-domain-commands-v2.js");
  assert.match(runtime,/MTADeteniDomainCommandsV2\?\.createDocument/);
  assert.match(runtime,/MTADeteniDomainCommandsV2\?\.transitionDocument/);
  assert.match(runtime,/MTADeteniDomainCommandsV2\?\.createDocumentRevision/);
  assert.match(runtime,/MTADeteniDomainCommandsV2\?\.restoreBackup/);
  assert.match(commands,/function createDocument\(s,document\)/);
  assert.match(commands,/function transitionDocument\(s,id,next,note\)/);
  assert.match(commands,/function createDocumentRevision\(s,id\)/);
  assert.match(commands,/function restoreBackup\(s,x\)/);
  const lifecycle=runtime.slice(runtime.indexOf("function startReview(id){"),runtime.indexOf("function downloadReport(id)",runtime.indexOf("function startReview(id){")));
  assert.doesNotMatch(lifecycle,/db\.documents\.unshift\(/);
});

test("H10 document generation preparation is read-only until canonical mutation",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  const commands=read("web/mta-domain-commands-v2.js");
  const block=runtime.slice(runtime.indexOf("async function generateValidatedReport"),runtime.indexOf("function workflowNote"));
  assert.match(block,/structuredClone\(r\)/);
  assert.match(block,/mtaDailyGuardReport\.prepare\(source\)/);
  assert.match(block,/MTADeteniDomainCommandsV2\?\.applyGeneratedDocument/);
  assert.doesNotMatch(block,/Object\.assign\(r,prepared\)/);
  assert.match(commands,/function applyGeneratedDocument\(s,id,prepared\)/);
});

test("H11 admin normalization is read-only and does not persist implicitly",()=>{
  const admin=read("web/admin-settings-v9.js");
  const block=admin.slice(admin.indexOf("function ensure()"),admin.indexOf("\nfunction nav()"));
  assert.match(block,/structuredClone\(source\)/);
  assert.doesNotMatch(block,/put\(d\)/);
  assert.doesNotMatch(block,/localStorage\.setItem/);
});

test("H12 QR bootstrap is read-only normalization and never writes storage",()=>{
  const shell=read("web/mta-unified-shell-v2.js");
  const block=shell.slice(shell.indexOf("function bootstrapQrResources"),shell.indexOf("\nconst esc=",shell.indexOf("function bootstrapQrResources")));
  assert.match(block,/structuredClone\(state\|\|\{\}\)/);
  assert.doesNotMatch(block,/write\(d\)/);
  assert.doesNotMatch(block,/localStorage\.setItem/);
});
