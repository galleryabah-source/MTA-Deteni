import assert from "node:assert/strict";
import test from "node:test";
import { runRepositoryOperation } from "../src/infrastructure/database/transaction-repository-bridge.ts";

const context={transactionId:"TX-1",requestId:"REQ-1",correlationId:"CORR-1",actorId:"USER-1",policyVersion:"P9.4-v1"};

test("repository operation receives the transaction context",async()=>{
 let seen;
 const result=await runRepositoryOperation(
  {run:async(ctx,operation)=>operation(ctx)},
  {execute:async(ctx)=>{seen=ctx;return "OK";}},
  context
 );
 assert.equal(result,"OK");
 assert.deepEqual(seen,context);
});

test("incomplete transaction context fails closed",async()=>{
 await assert.rejects(
  ()=>runRepositoryOperation(
   {run:async(ctx,operation)=>operation(ctx)},
   {execute:async()=> "BAD"},
   {...context,actorId:""}
  ),
  /INVALID_TRANSACTION_CONTEXT/
 );
});
