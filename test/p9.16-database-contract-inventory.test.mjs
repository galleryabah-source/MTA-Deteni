import assert from "node:assert/strict";
import test from "node:test";
import { validateDatabaseContractInventory, hasDuplicateObjects } from "../src/infrastructure/database/database-contract-inventory.ts";

const base={
 environment:"TEST",
 contractVersion:"P9.16-v1",
 objects:[
  {schema:"public",name:"mta_detainees",kind:"TABLE",ownerContract:"D3",required:true,sensitive:true},
  {schema:"public",name:"mta_audit_events",kind:"TABLE",ownerContract:"P9.5",required:true,sensitive:true},
 ]
};

test("valid inventory is accepted",()=>assert.equal(validateDatabaseContractInventory(base),true));
test("empty inventory is rejected",()=>assert.equal(validateDatabaseContractInventory({...base,objects:[]}),false));
test("duplicate database objects are detected",()=>assert.equal(hasDuplicateObjects([...base.objects,base.objects[0]]),true));
test("different kinds are not duplicates",()=>assert.equal(hasDuplicateObjects([
 {...base.objects[0],kind:"TABLE"},
 {...base.objects[0],kind:"INDEX"},
]),false));
