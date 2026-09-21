import assert from "node:assert/strict";
import test from "node:test";
import { reconcileSchema, migrationGate } from "../src/infrastructure/database/schema-reconciliation-contract.ts";

const expected=[{schema:"public",name:"mta_detainees",kind:"TABLE",contractVersion:"D3-v1"}];

test("missing object blocks migration",()=>{
 const items=reconcileSchema(expected,[]);
 assert.equal(items[0].status,"MISSING");
 assert.equal(migrationGate(items),"BLOCKED");
});

test("present but unverified object remains blocked",()=>{
 const items=reconcileSchema(expected,[{schema:"public",name:"mta_detainees",kind:"TABLE",fingerprint:"unknown"}]);
 assert.equal(items[0].status,"UNVERIFIED");
 assert.equal(migrationGate(items),"BLOCKED");
});

test("unexpected or mismatch statuses are blocking by contract",()=>{
 assert.equal(migrationGate([{expected:expected[0],status:"MISMATCH"}]),"BLOCKED");
 assert.equal(migrationGate([{expected:expected[0],status:"UNEXPECTED"}]),"BLOCKED");
});
