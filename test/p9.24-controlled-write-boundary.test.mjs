import assert from "node:assert/strict"; import test from "node:test"; import {authorizeControlledWrite} from "../src/infrastructure/database/controlled-write-boundary.ts";
const b={authenticated:true,permissionAllowed:true,scopeAllowed:true,dutyActive:true,stateAllowed:true};
test("valid write allowed",()=>assert.equal(authorizeControlledWrite(b),"ALLOW"));
test("auth required",()=>assert.equal(authorizeControlledWrite({...b,authenticated:false}),"AUTH_REQUIRED"));
test("permission denied",()=>assert.equal(authorizeControlledWrite({...b,permissionAllowed:false}),"PERMISSION_DENIED"));
test("scope denied",()=>assert.equal(authorizeControlledWrite({...b,scopeAllowed:false}),"SCOPE_DENIED"));
test("duty required",()=>assert.equal(authorizeControlledWrite({...b,dutyActive:false}),"DUTY_REQUIRED"));
test("invalid state denied",()=>assert.equal(authorizeControlledWrite({...b,stateAllowed:false}),"INVALID_STATE"));