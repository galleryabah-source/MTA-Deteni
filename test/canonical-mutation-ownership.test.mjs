import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read=p=>readFileSync(p,"utf8");

test("H1 placement has one canonical mutation owner",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  const shell=read("web/mta-unified-shell-v2.js");
  const placementUi=runtime.slice(runtime.indexOf("function addPlacement(){"),runtime.indexOf("function movement(v)",runtime.indexOf("function addPlacement(){")));
  assert.match(placementUi,/window\.MTADeteniDomainCommandsV2\.assignPlacement\(db/);
  assert.doesNotMatch(placementUi,/db\.placements\.unshift\(/);
  assert.match(shell,/function assignPlacementCommand\(state,options=\{\}\)/);
  assert.match(shell,/canonicalCommand\('assignPlacement'\)/);
  assert.doesNotMatch(shell,/d\.placements\.unshift\(placement\)/);
});

test("H2 detainee CRUD delegates mutation to canonical v2 domain commands",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  const commands=read("web/mta-domain-commands-v2.js");
  const block=runtime.slice(runtime.indexOf("function addDetainee(existing){"),runtime.indexOf("function placement(v)",runtime.indexOf("function addDetainee(existing){")));
  assert.match(block,/window\.MTADeteniDomainCommandsV2/);
  assert.match(block,/await command\.createDetainee/);
  assert.match(block,/await command\.updateDetainee/);
  assert.doesNotMatch(block,/db\.detainees\.unshift\(/);
  assert.match(commands,/function createDetainee/);
  assert.match(commands,/function updateDetainee/);
  assert.match(commands,/productionDetaineeMutation/);
});

test("H3 archive/status mutation has one canonical owner",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  const commands=read("web/mta-domain-commands-v2.js");
  const start=runtime.indexOf("async function archiveDetainee(id){");
  const end=runtime.indexOf("function placement(v)",start);
  const block=runtime.slice(start,end);
  assert.match(block,/const command=window\.MTADeteniDomainCommandsV2/);
  assert.match(block,/await command\.archiveDetainee/);
  assert.doesNotMatch(block,/\.status='NONAKTIF'/);
  assert.match(commands,/archiveDetainee\(s,id,o=\{\}\)/);
  assert.match(commands,/productionDetaineeMutation\('archive'/);
});

test("H4 legacy movement entrypoint is neutralized",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  const start=runtime.indexOf("function addMovement(){");
  const end=runtime.indexOf("function leave(v)",start);
  const block=runtime.slice(start,end);
  assert.match(block,/window\.show\('movement'\)/);
  assert.doesNotMatch(block,/db\.movements\.unshift\(/);
  assert.doesNotMatch(block,/LEGACY_MOVEMENT_CREATE/);
});

test("canonical v2 command module is wired before runtime feature modules",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  assert.match(runtime,/mta-domain-commands-v2\.js\?v=5/);
});
