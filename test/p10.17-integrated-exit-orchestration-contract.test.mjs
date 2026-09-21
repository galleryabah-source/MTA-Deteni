import assert from "node:assert/strict";
import test from "node:test";
import { evaluateExitOrchestration } from "../src/application/temporary-exit/integrated-exit-orchestration-contract.ts";

const ctx={requestId:"REQ-001",userId:"USER-001",authenticated:true,dutyActive:true,scopeAllowed:true};

test("allows request stage",()=>{
  const r=evaluateExitOrchestration({...ctx,permission:"leave.create"},{leaveStatus:"DRAFT",documentStatus:"NONE",escortStatus:"NONE",stage:"REQUEST"});
  assert.equal(r.decision,"ALLOWED"); assert.equal(r.nextStage,"VALIDATE");
});

test("blocks document before approval",()=>{
  const r=evaluateExitOrchestration({...ctx,permission:"document.generate"},{leaveStatus:"SUBMITTED",documentStatus:"NONE",escortStatus:"NONE",stage:"DOCUMENT"});
  assert.equal(r.decision,"INVALID_STATE");
});

test("blocks departure until document is issued and escort assigned",()=>{
  const r=evaluateExitOrchestration({...ctx,permission:"leave.depart"},{leaveStatus:"APPROVED",documentStatus:"GENERATED",escortStatus:"PLANNED",stage:"DEPART"});
  assert.equal(r.decision,"INVALID_STATE");
});

test("requires active duty and scope",()=>{
  const duty=evaluateExitOrchestration({...ctx,permission:"leave.create",dutyActive:false},{leaveStatus:"DRAFT",documentStatus:"NONE",escortStatus:"NONE",stage:"REQUEST"});
  const scope=evaluateExitOrchestration({...ctx,permission:"leave.create",scopeAllowed:false},{leaveStatus:"DRAFT",documentStatus:"NONE",escortStatus:"NONE",stage:"REQUEST"});
  assert.equal(duty.decision,"DUTY_REQUIRED"); assert.equal(scope.decision,"SCOPE_DENIED");
});

test("is deterministic",()=>{
  const input={...ctx,permission:"escort.assign"};
  const state={leaveStatus:"APPROVED",documentStatus:"ISSUED",escortStatus:"PLANNED",stage:"ESCORT"};
  assert.deepEqual(evaluateExitOrchestration(input,state),evaluateExitOrchestration(input,state));
});
