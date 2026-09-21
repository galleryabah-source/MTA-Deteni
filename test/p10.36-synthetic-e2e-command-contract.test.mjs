import assert from "node:assert/strict"; import {test} from "node:test";
const u=new URL("../src/application/testing/synthetic-e2e-command-contract.ts",import.meta.url);
const ok={syntheticOnly:true,authorized:true,idempotency:"ACQUIRED",stateValid:true,runtimeReady:true,auditAvailable:true,outboxRequired:true,outboxAvailable:true};
test("P10.36 rejects non-synthetic execution",async()=>{const {evaluateSyntheticE2E}=await import(u);assert.throws(()=>evaluateSyntheticE2E({...ok,syntheticOnly:false}),/SYNTHETIC_ONLY_REQUIRED/)});
test("P10.36 permits only fully gated synthetic execution",async()=>{const {evaluateSyntheticE2E}=await import(u);assert.equal(evaluateSyntheticE2E(ok),"READY_FOR_EXECUTION")});
test("P10.36 blocks replay and conflict",async()=>{const {evaluateSyntheticE2E}=await import(u);assert.equal(evaluateSyntheticE2E({...ok,idempotency:"REPLAY"}),"BLOCKED_IDEMPOTENCY");assert.equal(evaluateSyntheticE2E({...ok,idempotency:"CONFLICT"}),"BLOCKED_IDEMPOTENCY")});
test("P10.36 blocks missing audit",async()=>{const {evaluateSyntheticE2E}=await import(u);assert.equal(evaluateSyntheticE2E({...ok,auditAvailable:false}),"BLOCKED_AUDIT")});
