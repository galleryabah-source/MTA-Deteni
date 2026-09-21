import assert from "node:assert/strict";
import test from "node:test";
import { validateTemporaryExitCommand } from "../src/application/temporary-exit/temporary-exit-command-contract.ts";

const base={authenticated:true,dutyActive:true,scopeAllowed:true,policyAllowed:true};
const state={leaveStatus:"APPROVED",documentStatus:"ISSUED",escortStatus:"ASSIGNED"};
const command=(stage,permission)=>({requestId:"REQ",correlationId:"CORR",actorId:"USER",leaveId:"L1",stage,permission,policyVersion:"P10.20-v1"});

test("requires authentication",()=>assert.equal(validateTemporaryExitCommand(command("DEPART","leave.depart"),{...base,authenticated:false},state),"AUTH_REQUIRED"));
test("requires stage permission",()=>assert.equal(validateTemporaryExitCommand(command("DEPART","leave.return"),base,state),"PERMISSION_DENIED"));
test("requires active duty",()=>assert.equal(validateTemporaryExitCommand(command("DEPART","leave.depart"),{...base,dutyActive:false},state),"DUTY_REQUIRED"));
test("requires scope",()=>assert.equal(validateTemporaryExitCommand(command("DEPART","leave.depart"),{...base,scopeAllowed:false},state),"SCOPE_DENIED"));
test("requires policy",()=>assert.equal(validateTemporaryExitCommand(command("DEPART","leave.depart"),{...base,policyAllowed:false},state),"POLICY_DENIED"));
test("departure requires approved leave, issued document, assigned escort",()=>assert.equal(validateTemporaryExitCommand(command("DEPART","leave.depart"),base,{...state,documentStatus:"DRAFT"}),"INVALID_STATE"));
test("return requires departed leave",()=>assert.equal(validateTemporaryExitCommand(command("RETURN","leave.return"),base,{...state,leaveStatus:"APPROVED"}),"INVALID_STATE"));
test("complete requires received leave",()=>assert.equal(validateTemporaryExitCommand(command("COMPLETE","leave.complete"),base,{...state,leaveStatus:"RETURNED"}),"INVALID_STATE"));
test("valid departure is allowed",()=>assert.equal(validateTemporaryExitCommand(command("DEPART","leave.depart"),base,state),"ALLOWED"));
