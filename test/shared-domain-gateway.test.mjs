import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read=file=>readFile(new URL("../web/"+file,import.meta.url),"utf8");

test("shared domain gateway executes cloud detainee CRUD through runtime adapter", async()=>{
  const code=await read("shared-domain-gateway-v1.js");
  const calls=[];
  const context={window:{MTADeteniRuntimeAdapter:{
    getMode:()=> "CLOUD",
    list:async resource=>{calls.push(["list",resource]);return {data:[{id:"DET-SHARED-1",code:"DET-SHARED-1",name:"SYNTHETIC SHARED",status:"AKTIF"}]}},
    create:async(resource,body)=>{calls.push(["create",resource,body]);return {data:{...body,id:"DET-SHARED-2"}}},
    update:async(resource,id,body)=>{calls.push(["update",resource,id,body]);return {data:{id,...body}}},
    remove:async(resource,id)=>{calls.push(["remove",resource,id]);return {data:{id}}}
  }},console};
  vm.runInNewContext(code,context);
  const g=context.window.MTADeteniSharedDomain;
  assert.equal(g.cloud(),true);
  assert.deepEqual(await g.listDetainees(),[{id:"DET-SHARED-1",code:"DET-SHARED-1",name:"SYNTHETIC SHARED",status:"AKTIF"}]);
  const created=await g.createDetainee({code:"DET-X",name:"X"});
  assert.equal(created.data.id,"DET-SHARED-2");
  await g.updateDetainee("DET-SHARED-2",{status:"NONAKTIF"});
  await g.archiveDetainee("DET-SHARED-2");
  assert.deepEqual(calls.map(x=>x.slice(0,2)),[["list","detainees"],["create","detainees"],["update","detainees"],["update","detainees"]]);
});

test("application shell actually loads and wires shared persistence gateway",async()=>{
  const html=await read("index.html");
  assert.match(html,/shared-domain-gateway-v1\.js\?v=1/);
  assert.match(html,/syncSharedDetaineeDomain/);
  assert.match(html,/window\.MTADeteniSharedDomain\.createDetainee/);
  assert.match(html,/window\.MTADeteniSharedDomain\.updateDetainee/);
  assert.match(html,/window\.MTADeteniSharedDomain\.archiveDetainee/);
});
