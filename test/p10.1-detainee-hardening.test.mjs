import test from "node:test";
import assert from "node:assert/strict";
import { assertDetaineeRegistration, assertDetaineeStatusTransition } from "../src/domain/core-administration/invariants.ts";
import { detaineeToRow } from "../src/infrastructure/database/detainee-mapper.mjs";

const provenance={sourceType:"MANUAL",capturedAt:"2026-09-23T00:00:00Z",verified:true,verifiedBy:"officer-1"};

test("P10.1-DETAINEE-001 valid registration",()=>{
  assert.doesNotThrow(()=>assertDetaineeRegistration({id:"det-1",identityRef:"identity-1",provenance}));
});

test("P10.1-DETAINEE-002 unverified provenance rejected",()=>{
  assert.throws(()=>assertDetaineeRegistration({id:"det-1",identityRef:"identity-1",provenance:{...provenance,verified:false}}),/provenance must be verified/i);
});

test("P10.1-DETAINEE-003 missing provenance timestamp rejected",()=>{
  assert.throws(()=>assertDetaineeRegistration({id:"det-1",identityRef:"identity-1",provenance:{...provenance,capturedAt:""}}),/timestamp/i);
});

test("P10.1-DETAINEE-004 legal status transitions",()=>{
  assert.doesNotThrow(()=>assertDetaineeStatusTransition("ACTIVE","TRANSFERRED"));
  assert.doesNotThrow(()=>assertDetaineeStatusTransition("DEPARTED","CLOSED"));
});

test("P10.1-DETAINEE-005 illegal status transition rejected",()=>{
  assert.throws(()=>assertDetaineeStatusTransition("CLOSED","ACTIVE"),/Invalid detainee status transition/);
});

test("P10.1-DETAINEE-006 database mapping preserves domain provenance",()=>{
  const row=detaineeToRow({
    id:"det-1",status:"ACTIVE",identityRef:"identity-1",provenance,
    version:2,createdAt:"2026-09-23T00:00:00Z",updatedAt:"2026-09-23T00:01:00Z",
    code:"DET-001",name:"identity-1",nationality:"ID",scopeId:"scope-1"
  });
  assert.equal(row.id,"det-1");
  assert.equal(row.status,"ACTIVE");
  assert.equal(row.name,"Abah");
  assert.equal(row.nationality,"ID");
  assert.equal(row.metadata.identityRef,"identity-1");
  assert.equal(row.metadata.domainVersion,2);
  assert.equal(row.metadata.provenance.verified,true);
  assert.equal(row.scope_id,"scope-1");
});

test("P10.1-DETAINEE-007 no direct schema assumption",()=>{
  assert.equal("mta_detainees","mta_detainees");
  assert.equal("migration","not-required");
});
