import assert from "node:assert/strict";
import test from "node:test";
import { evaluateCriticalCommand } from "../src/application/workflow/critical-command-gate.ts";

const base={authorized:true,idempotencyOutcome:"ACQUIRED",domainStateValid:true,auditAvailable:true,outboxRequired:false};

test("authorized valid command can execute when no outbox is required",()=>assert.equal(evaluateCriticalCommand(base),"EXECUTE"));
test("authorization denial happens before mutation",()=>assert.equal(evaluateCriticalCommand({...base,authorized:false}),"DENY_AUTHORIZATION"));
test("idempotency conflict is rejected",()=>assert.equal(evaluateCriticalCommand({...base,idempotencyOutcome:"CONFLICT"}),"DENY_IDEMPOTENCY_CONFLICT"));
test("replay produces no new mutation",()=>assert.equal(evaluateCriticalCommand({...base,idempotencyOutcome:"REPLAY"}),"REPLAY"));
test("invalid state is rejected",()=>assert.equal(evaluateCriticalCommand({...base,domainStateValid:false}),"DENY_STATE"));
test("mandatory audit failure fails safe",()=>assert.equal(evaluateCriticalCommand({...base,auditAvailable:false}),"FAIL_SAFE_AUDIT"));
