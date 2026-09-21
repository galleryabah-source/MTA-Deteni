import assert from"node:assert/strict";import test from"node:test";import{authorizeEscort}from"../src/application/escort/escort-usecase-contract.js";
const actor={userId:"USR-1",dutyActive:true,scopeAllowed:true,permission:"escort.assign"};
test("P10.15 allows assignment",()=>assert.equal(authorizeEscort(actor,"ASSIGN"),"ALLOWED"));
test("P10.15 denies completion without permission",()=>assert.equal(authorizeEscort(actor,"COMPLETE"),"PERMISSION_DENIED"));
test("P10.15 denies inactive duty",()=>assert.equal(authorizeEscort({...actor,dutyActive:false},"ASSIGN"),"DUTY_REQUIRED"));