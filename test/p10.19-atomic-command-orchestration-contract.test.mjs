import assert from "node:assert/strict";
import test from "node:test";
import { planAtomicCommand } from "../src/application/workflow/atomic-command-orchestration-contract.ts";

const envelope={requestId:"REQ-1",correlationId:"CORR-1",idempotencyKey:"IDEMP-1",requestHash:"HASH-1",actorId:"USER-1",command:"LEAVE.SUBMIT"};

test("acquired command requires transaction, audit and outbox evidence",()=>{
  const r=planAtomicCommand(envelope,"ACQUIRED");
  assert.equal(r.outcome,"ACQUIRED");
  assert.equal(r.transactionId,"REQ-1");
  assert.deepEqual(r.evidence,{auditRequired:true,outboxRequired:true});
});

test("replay does not schedule a duplicate side effect",()=>{
  const r=planAtomicCommand(envelope,"REPLAY");
  assert.equal(r.outcome,"REPLAY");
  assert.equal(r.evidence.outboxRequired,false);
});

test("idempotency conflict is explicit and auditable",()=>{
  const r=planAtomicCommand(envelope,"CONFLICT");
  assert.equal(r.outcome,"CONFLICT");
  assert.equal(r.evidence.auditRequired,true);
});

test("incomplete command envelope fails closed",()=>{
  const r=planAtomicCommand({...envelope,actorId:""},"ACQUIRED");
  assert.equal(r.outcome,"FAILED");
  assert.equal(r.evidence.auditRequired,true);
});
