import { strict as assert } from "node:assert";
import fs from "node:fs";

const read=p=>fs.readFileSync(p,"utf8");
const webFiles=fs.readdirSync("web").filter(p=>p.endsWith(".js")).map(p=>"web/"+p);
const allowStorage=new Set(["web/mta-state-kernel-v1.js","web/mta-unified-shell-v1.js","web/preview-v10.js","web/qr-print-clean-v2.js","web/qr-print-clean.js"]);

for(const path of webFiles){
  const source=read(path);
  if(!allowStorage.has(path) && path!=='web/desktop-shell-v2.js') assert.doesNotMatch(source,/localStorage\.setItem\(/,path+" must not persist outside canonical state kernel/runtime boundary");
  if(path==='web/desktop-shell-v2.js') assert.doesNotMatch(source,/localStorage\.setItem\((?!key,collapsed\?'1':'0')/,path+" contains non-UI persistence");
}

test("legacy unified shell v1 is not part of the active runtime",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  assert.doesNotMatch(runtime,/mta-unified-shell-v1\.js/);
});

test("global mutation ownership has one canonical command module",()=>{
  const shell=read("web/mta-unified-shell-v2.js");
  const commands=read("web/mta-domain-commands-v2.js");
  assert.match(shell,/canonicalCommand\('assignPlacement'\)/);
  assert.match(shell,/canonicalCommand\('createMovement'\)/);
  assert.match(shell,/canonicalCommand\('advanceLeave'\)/);
  assert.doesNotMatch(shell,/d\.placements\.unshift\(/);
  assert.doesNotMatch(shell,/d\.movements\.unshift\(/);
  assert.doesNotMatch(shell,/leave\.status=next/);
  assert.match(commands,/function assignPlacement\(/);
  assert.match(commands,/function createMovement\(/);
  assert.match(commands,/function advanceLeave\(/);
});

test("read normalization is non-mutating to caller state",()=>{
  const kernel=read("web/mta-state-kernel-v1.js");
  assert.match(kernel,/state=clone\(state\)/);
  assert.match(kernel,/function normalize\(state\)/);
});

test("QR preview bootstrap is read-only",()=>{
  const preview=read("web/preview-v6.js");
  const block=preview.slice(preview.indexOf("function ensure()"),preview.indexOf("\nfunction boot()"));
  assert.doesNotMatch(block,/put\(d\)/);
  assert.doesNotMatch(block,/localStorage\.setItem/);
  assert.match(block,/structuredClone\(get\(\)\)/);
});

console.log("GLOBAL_MUTATION_SURFACE_CONTRACT PASS");
