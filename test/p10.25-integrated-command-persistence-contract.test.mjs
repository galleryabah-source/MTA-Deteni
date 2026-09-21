import assert from "node:assert/strict";
import test from "node:test";
import { executeIntegratedCommand } from "../src/application/workflow/integrated-command-persistence-contract.ts";

const context={requestId:"REQ-1",correlationId:"CORR-1",actorId:"USER-1",transactionId:"TX-1",policyVersion:"P10.20-v1"};
const makePorts=(overrides={})=>({
 authorize:async()=>true,
 idempotency:async()=>"ACQUIRED",
 validateState:async()=>true,
 transaction:async(fn)=>fn(context),
 audit:async()=>true,
 outbox:async()=>true,
 ...overrides
});

test("authorization denial is fail-closed",async()=>{
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({authorize:async()=>false}));
 assert.equal(r.status,"DENIED");
});

test("replay creates no execution",async()=>{
 let tx=0;
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({idempotency:async()=>"REPLAY",transaction:async()=>{tx++;}}));
 assert.equal(r.status,"REPLAY"); assert.equal(tx,0);
});

test("conflict is denied",async()=>{
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({idempotency:async()=>"CONFLICT"}));
 assert.equal(r.status,"DENIED");
});

test("audit unavailability fails safe",async()=>{
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({audit:async()=>false}));
 assert.equal(r.status,"FAILED_SAFE");
});

test("outbox unavailability fails safe",async()=>{
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({outbox:async()=>false}));
 assert.equal(r.status,"FAILED_SAFE");
});
