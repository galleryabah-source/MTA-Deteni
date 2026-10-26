import assert from "node:assert/strict";
import test from "node:test";
import { evaluateKernelEvidence, REQUIRED_KERNEL_CONTRACTS } from "../src/infrastructure/certification/kernel-certification-evidence.ts";

const accepted = Object.fromEntries(REQUIRED_KERNEL_CONTRACTS.map((id)=>[id,{contractId:id,status:"ACCEPTED",evidenceRef:"evidence/"+id}]));
const list = () => Object.values(accepted);

test("complete accepted evidence can certify",()=>{
  const r=evaluateKernelEvidence(list());
  assert.equal(r.status,"CERTIFIED");
});

test("missing evidence blocks certification",()=>{
  const items=list().slice(0,-1);
  const r=evaluateKernelEvidence(items);
  assert.equal(r.status,"NOT_CERTIFIED");
  assert.equal(r.missing.includes("P9.12"),true);
});

test("failed evidence blocks certification",()=>{
  const items=list().map((x)=>x.contractId==="P9.5"?{...x,status:"FAIL"}:x);
  const r=evaluateKernelEvidence(items);
  assert.equal(r.status,"NOT_CERTIFIED");
  assert.equal(r.failed.includes("P9.5"),true);
});

test("unverified evidence blocks certification",()=>{
  const items=list().map((x)=>x.contractId==="P9.10"?{...x,status:"UNVERIFIED"}:x);
  const r=evaluateKernelEvidence(items);
  assert.equal(r.status,"NOT_CERTIFIED");
  assert.equal(r.unverified.includes("P9.10"),true);
});
