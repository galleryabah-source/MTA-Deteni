import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

const read=p=>readFileSync(p,"utf8");

test("NID application boundary rejects caller-supplied NID on create/update",async()=>{
  const source=read("web/mta-domain-commands-v1.js");
  const context={window:{MTADeteniStateKernel:{audit(){}}},crypto:{randomUUID:()=> "00000000-0000-4000-8000-000000000001"}};
  vm.runInNewContext(source,context,{filename:"mta-domain-commands-v1.js"});
  const api=context.window.MTADeteniDomainCommands;
  const state={detainees:[{id:"D1",code:"DET-001",name:"Existing",nationality:"Contoh",status:"NONAKTIF"}],placements:[],audit:[]};

  const create=await api.createDetainee(state,{code:"DET-002",name:"Injected",entryYear:2026,nid:"RDM-PTK-26-999999",status:"NONAKTIF"});
  assert.equal(create.ok,false);
  assert.equal(create.code,"NID_SYSTEM_GENERATED");

  const update=await api.updateDetainee(state,{id:"D1",code:"DET-001",name:"Existing",entryYear:2026,nid:"RDM-PTK-26-999999",status:"NONAKTIF"});
  assert.equal(update.ok,false);
  assert.equal(update.code,"NID_IMMUTABLE");
});

test("entry year is create-only identity input; it cannot be changed after issuance",async()=>{
  const source=read("web/mta-domain-commands-v1.js");
  const context={window:{MTADeteniStateKernel:{audit(){}}},crypto:{randomUUID:()=> "00000000-0000-4000-8000-000000000002"}};
  vm.runInNewContext(source,context,{filename:"mta-domain-commands-v1.js"});
  const api=context.window.MTADeteniDomainCommands;
  const state={detainees:[],placements:[],audit:[]};
  const created=await api.createDetainee(state,{code:"DET-002",name:"Boundary Test",entryYear:2026,status:"NONAKTIF"});
  assert.equal(created.ok,true);
  assert.equal(created.detainee.entryYear,2026);
  const updated=await api.updateDetainee(state,{id:created.detainee.id,code:"DET-002",name:"Boundary Test",entryYear:2027,status:"NONAKTIF"});
  assert.equal(updated.ok,false);
  assert.equal(updated.code,"ENTRY_YEAR_IMMUTABLE");
});

test("production API explicitly rejects NID and protects entry year",()=>{
  const api=read("supabase/functions/mta-api/index.ts");
  assert.match(api,/hasOwnProperty\.call\(body,"nid"\)/);
  assert.match(api,/NID_SYSTEM_GENERATED/);
  assert.match(api,/NID_IMMUTABLE/);
  assert.match(api,/ENTRY_YEAR_REQUIRED/);
  assert.match(api,/ENTRY_YEAR_IMMUTABLE/);
});

test("production adapter never forwards caller NID and sends entry_year only on create",()=>{
  const adapter=read("web/mta-production-state-adapter-v1.js");
  assert.match(adapter,/hasOwnProperty\.call\(args,'nid'\)/);
  assert.match(adapter,/clean\.entry_year=normalizedEntryYear/);
  assert.match(adapter,/ENTRY_YEAR_IMMUTABLE/);
});

test("detainee UI exposes entry year but never exposes NID as an input",()=>{
  const runtime=read("web/mta-app-runtime-full.js");
  const start=runtime.indexOf("function addDetainee(existing){");
  const end=runtime.indexOf("function editDetainee(id)",start);
  const block=runtime.slice(start,end);
  assert.match(block,/name="entryYear"/);
  assert.doesNotMatch(block,/name="nid"/);
  assert.doesNotMatch(block,/f\.get\(['"]nid['"]\)/);
  assert.match(block,/createDetainee\(db,\{code,name,nationality,entryYear/);
  assert.doesNotMatch(block,/createDetainee\(db,\{[^}]*nid/);
  assert.doesNotMatch(block,/updateDetainee\(db,\{[^}]*nid/);
});

test("canonical domain command v2 remains the only production detainee mutation entry",()=>{
  const commands=read("web/mta-domain-commands-v2.js");
  assert.match(commands,/productionDetaineeMutation\('create',o\)/);
  assert.match(commands,/productionDetaineeMutation\('update',o\)/);
  assert.match(commands,/productionDetaineeMutation\('archive',\{\.\.\.o,id\}\)/);
});
