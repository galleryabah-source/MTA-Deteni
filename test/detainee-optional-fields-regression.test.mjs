import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const runtime=fs.readFileSync("web/mta-app-runtime-full.js","utf8");
const commands=fs.readFileSync("web/mta-domain-commands-v1.js","utf8");

test("Tambah Deteni exposes optional identity fields without required validation",()=>{
  assert.match(runtime,/name="gender"/);
  assert.match(runtime,/name="dateOfBirth" type="date"/);
  assert.match(runtime,/name="passportNumber"/);
  assert.match(runtime,/name="notes"/);
  assert.match(runtime,/Jenis Kelamin <span class="muted">\(opsional\)<\/span>/);
  assert.match(runtime,/Tanggal Lahir <span class="muted">\(opsional\)<\/span>/);
  assert.match(runtime,/No Paspor <span class="muted">\(opsional\)<\/span>/);
  assert.match(runtime,/Catatan <span class="muted">\(opsional\)<\/span>/);
  assert.doesNotMatch(runtime,/name="gender"[^>]*required/);
  assert.doesNotMatch(runtime,/name="dateOfBirth"[^>]*required/);
  assert.doesNotMatch(runtime,/name="passportNumber"[^>]*required/);
  assert.doesNotMatch(runtime,/name="notes"[^>]*required/);
});

test("canonical detainee command persists optional fields and accepts them blank",()=>{
  const audit=[];
  const context={
    window:{
      MTADeteniStateKernel:{
        audit(state,action,type,id,result,meta){
          audit.push({action,type,id,result,meta});
          (state.audit??=[]).push({action,type,id,result});
        }
      }
    },
    crypto:{randomUUID:()=> "00000000-0000-4000-8000-000000000001"}
  };
  vm.runInNewContext(commands,context,{filename:"mta-domain-commands-v1.js"});
  const api=context.window.MTADeteniDomainCommands;
  const state={detainees:[],rooms:[],placements:[],audit:[]};

  const created=api.createDetainee(state,{
    code:"DET-OPTIONAL-01",
    name:"Synthetic Optional",
    nationality:"Contoh",
    gender:"",
    dateOfBirth:"",
    passportNumber:"",
    notes:"",
    status:"NONAKTIF"
  });

  assert.equal(created.ok,true);
  assert.equal(created.detainee.gender,"");
  assert.equal(created.detainee.dateOfBirth,"");
  assert.equal(created.detainee.passportNumber,"");
  assert.equal(created.detainee.notes,"");

  const updated=api.updateDetainee(state,{
    id:created.detainee.id,
    code:"DET-OPTIONAL-01",
    name:"Synthetic Optional Updated",
    nationality:"Contoh",
    gender:"",
    dateOfBirth:"",
    passportNumber:"",
    notes:"",
    status:"NONAKTIF"
  });

  assert.equal(updated.ok,true);
  assert.equal(updated.detainee.gender,"");
  assert.equal(updated.detainee.dateOfBirth,"");
  assert.equal(updated.detainee.passportNumber,"");
  assert.equal(updated.detainee.notes,"");
  assert.equal(audit.length,2);
});
