import assert from "node:assert/strict";
import test from "node:test";
import { executeIntegratedCommand } from "../src/application/workflow/integrated-command-persistence-contract.ts";

const context={requestId:"REQ-1",correlationId:"CORR-1",actorId:"USER-1",transactionId:"TX-1",policyVersion:"P10.20-v1"};

const makePorts=(overrides={})=>({
 authorize:async()=>true,
 idempotency:async()=>"ACQUIRED",
 validateState:async()=>true,
 ensureAuditAvailable:async()=>true,
 transaction:async(fn)=>fn(context),
 persistAudit:async()=>{},
 persistOutbox:async()=>{},
 executeDomainMutation:async()=>({ok:true}),
 ...overrides
});

test("authorization denial is fail-closed",async()=>{
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({authorize:async()=>false}));
 assert.equal(r.status,"DENIED");
});

test("replay creates no execution",async()=>{
 let executions=0;
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({idempotency:async()=>"REPLAY",executeDomainMutation:async()=>{executions++;return{};}}));
 assert.equal(r.status,"REPLAY"); assert.equal(executions,0);
});

test("conflict is denied",async()=>{
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({idempotency:async()=>"CONFLICT"}));
 assert.equal(r.status,"DENIED");
});

test("audit unavailability fails safe",async()=>{
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({ensureAuditAvailable:async()=>false}));
 assert.equal(r.status,"FAILED_SAFE");
});

test("domain mutation, audit and outbox share one transaction boundary",async()=>{
 const calls=[];
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({
   transaction:async(fn)=>{calls.push("transaction");return fn(context);},
   executeDomainMutation:async()=>{calls.push("mutation");return {ok:true};},
   persistAudit:async()=>{calls.push("audit");},
   persistOutbox:async()=>{calls.push("outbox");},
 }));
 assert.equal(r.status,"EXECUTED");
 assert.deepEqual(calls,["transaction","mutation","audit","outbox"]);
});

test("outbox failure fails safe",async()=>{
 const r=await executeIntegratedCommand(context,{command:"LEAVE.SUBMIT"},makePorts({persistOutbox:async()=>{throw new Error("OUTBOX_UNAVAILABLE");}}));
 assert.equal(r.status,"FAILED_SAFE");
});
