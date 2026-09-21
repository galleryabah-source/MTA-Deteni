import assert from"node:assert/strict";import test from"node:test";import{authorizeLeaveTransition}from"../src/application/leave/leave-workflow-contract.js";
const actor={userId:"USR-1",role:"EDITOR",dutyActive:true,scopeAllowed:true};
test("P10.14 allows valid transition",()=>assert.equal(authorizeLeaveTransition(actor,"DRAFT","SUBMITTED"),"ALLOWED"));
test("P10.14 blocks invalid transition",()=>assert.equal(authorizeLeaveTransition(actor,"DRAFT","APPROVED"),"INVALID_STATE"));
test("P10.14 blocks inactive duty",()=>assert.equal(authorizeLeaveTransition({...actor,dutyActive:false},"APPROVED","DEPARTED"),"DUTY_REQUIRED"));
test("P10.14 blocks wrong scope",()=>assert.equal(authorizeLeaveTransition({...actor,scopeAllowed:false},"APPROVED","DEPARTED"),"SCOPE_DENIED"));