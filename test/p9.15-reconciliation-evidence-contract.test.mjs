import assert from "node:assert/strict";
import test from "node:test";
import { certifyReconciliationEvidence } from "../src/infrastructure/database/reconciliation-evidence-contract.ts";

const base={evidenceId:"REC-1",contractVersion:"P9.15-v1",generatedAt:"2026-09-21T01:00:00Z",environment:"TEST"};

test("complete matching evidence passes",()=>{
 assert.equal(certifyReconciliationEvidence({...base,items:[{schema:"public",name:"mta_detainees",kind:"TABLE",status:"MATCH",expectedFingerprint:"abc",actualFingerprint:"abc"}]}),"PASS");
});
test("missing fingerprint is not certified",()=>{
 assert.equal(certifyReconciliationEvidence({...base,items:[{schema:"public",name:"mta_detainees",kind:"TABLE",status:"MATCH"}]}),"NOT_CERTIFIED");
});
test("mismatch is not certified",()=>{
 assert.equal(certifyReconciliationEvidence({...base,items:[{schema:"public",name:"mta_detainees",kind:"TABLE",status:"MISMATCH",expectedFingerprint:"abc",actualFingerprint:"def"}]}),"NOT_CERTIFIED");
});
