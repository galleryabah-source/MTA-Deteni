import test from "node:test";
import assert from "node:assert/strict";
import {createExecutionContext,assertExecutionContextContinuity} from "../src/application/execution-context-contract.ts";
import {createTransactionRunner,createIdempotencyStore} from "../src/infrastructure/database/transaction-idempotency.mjs";
import {redactValue,createObservabilityEvent,assertObservabilityContinuity} from "../src/infrastructure/observability/observability-runtime.mjs";
import {authorizePrivateObjectAccess,buildPrivateObjectMetadata} from "../src/infrastructure/storage/private-storage-runtime.mjs";

test("P9.11 unified kernel continuity: context -> transaction -> idempotency -> observability -> storage",async()=>{
 const context=createExecutionContext({requestId:"req-1",correlationId:"corr-1",transactionId:"tx-1",idempotencyKey:"idem-1"});
 assert.doesNotThrow(()=>assertExecutionContextContinuity(context,{requestId:"req-1",correlationId:"corr-1",transactionId:"tx-1",idempotencyKey:"idem-1"}));
 const calls=[];
 const txRunner=createTransactionRunner({query:async({text})=>calls.push(text)});
 await txRunner.transaction(async({transactionId})=>{assert.match(transactionId,/^[0-9a-f-]{36}$/);});
 assert.deepEqual(calls,["BEGIN","COMMIT"]);
 const idem=createIdempotencyStore();
 assert.deepEqual(idem.begin(context.idempotencyKey,"hash-1"),{status:"ACQUIRED"});
 assert.deepEqual(idem.complete(context.idempotencyKey,"response-1"),{status:"COMPLETED"});
 assert.deepEqual(idem.begin(context.idempotencyKey,"hash-1"),{status:"REPLAY",responseHash:"response-1"});
 const event=createObservabilityEvent({eventName:"mutation.completed",requestId:context.requestId,correlationId:context.correlationId,occurredAt:"2026-09-24T00:00:00Z",metadata:{token:"secret"}});
 assert.equal(event.metadata.token,"[REDACTED]");
 assert.equal(assertObservabilityContinuity(event,context),true);
 assert.deepEqual(authorizePrivateObjectAccess({authenticated:true,scopeValid:true,classificationAllowed:true,objectId:"DET-1"}),{allowed:true,reasonCode:"ALLOW",objectId:"DET-1"});
 const metadata=buildPrivateObjectMetadata({objectId:"DET-1",bucket:"private",contentType:"application/pdf",sizeBytes:1,classification:"RESTRICTED",contentHash:"a".repeat(64)});
 assert.equal(metadata.public,false);
});

test("P9.11 unified kernel fails closed on context drift",()=>{
 const context=createExecutionContext({requestId:"req-1",correlationId:"corr-1",transactionId:"tx-1",idempotencyKey:"idem-1"});
 assert.throws(()=>assertExecutionContextContinuity(context,{correlationId:"corr-drift"}),/EXECUTION_CONTEXT_MISMATCH/);
 assert.throws(()=>assertObservabilityContinuity({requestId:"req-drift",correlationId:"corr-1"},{requestId:"req-1",correlationId:"corr-1"}),/OBSERVABILITY_CONTEXT_MISMATCH/);
});
