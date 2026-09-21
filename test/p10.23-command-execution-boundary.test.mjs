import assert from "node:assert/strict";
import test from "node:test";
import { decideCommandExecution } from "../src/application/workflow/command-execution-boundary.ts";

const valid={authorizationAllowed:true,commandEnvelopeValid:true,idempotencyOutcome:"ACQUIRED",domainStateValid:true,auditAvailable:true,outboxRequired:false,outboxAvailable:true};

test("valid command reaches execution boundary",()=>assert.equal(decideCommandExecution(valid),"EXECUTE"));
test("authorization is evaluated first",()=>assert.equal(decideCommandExecution({...valid,authorizationAllowed:false,commandEnvelopeValid:false}),"DENY_AUTHORIZATION"));
test("invalid envelope is denied before mutation",()=>assert.equal(decideCommandExecution({...valid,commandEnvelopeValid:false}),"DENY_ENVELOPE"));
test("conflict never executes",()=>assert.equal(decideCommandExecution({...valid,idempotencyOutcome:"CONFLICT"}),"DENY_IDEMPOTENCY_CONFLICT"));
test("replay does not execute again",()=>assert.equal(decideCommandExecution({...valid,idempotencyOutcome:"REPLAY"}),"REPLAY"));
test("audit failure fails safe",()=>assert.equal(decideCommandExecution({...valid,auditAvailable:false}),"FAIL_SAFE_AUDIT"));
test("required unavailable outbox fails safe",()=>assert.equal(decideCommandExecution({...valid,outboxRequired:true,outboxAvailable:false}),"FAIL_SAFE_OUTBOX"));
