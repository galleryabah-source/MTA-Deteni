import assert from "node:assert/strict";
import test from "node:test";
import { authorize } from "../src/application/security/authorization-decision-bridge.ts";

const valid={authenticated:true,role:"EDITOR",permission:"leave.submit",scopeAllowed:true,dutyActive:true,resourceAllowed:true,currentStateAllowed:true,policyAllowed:true};

test("allows only when every authorization dimension is satisfied",()=>assert.equal(authorize(valid).allowed,true));
test("denies before resource evaluation when unauthenticated",()=>assert.equal(authorize({...valid,authenticated:false}).reasonCode,"AUTH_REQUIRED"));
test("denies wrong scope",()=>assert.equal(authorize({...valid,scopeAllowed:false}).reasonCode,"SCOPE_DENIED"));
test("denies inactive duty",()=>assert.equal(authorize({...valid,dutyActive:false}).reasonCode,"DUTY_INACTIVE"));
test("denies invalid current state",()=>assert.equal(authorize({...valid,currentStateAllowed:false}).reasonCode,"INVALID_STATE"));
test("denies policy failure",()=>assert.equal(authorize({...valid,policyAllowed:false}).reasonCode,"POLICY_DENIED"));
