import test from "node:test";import assert from "node:assert/strict";import {assertRuntimeCommand,normalizeRuntimeResult} from "../src/application/p11-runtime-adapter.ts";import {assertRecoverableFailure,recoveryOutcome} from "../src/application/p11-recovery-contract.ts";
const c={journeyId:"J1",stage:"MUTATION",requestId:"R1",correlationId:"C1",actorId:"A1",resourceType:"DETAINEE",resourceId:"D1",idempotencyKey:"I1",payload:{}};
test("P11.13 adapter command contract",()=>assert.doesNotThrow(()=>assertRuntimeCommand(c)));
test("P11.14 result preserves tracing identity",()=>{const r=normalizeRuntimeResult(c,{accepted:true,status:"SUCCESS",code:"MUTATION_ACCEPTED"});assert.equal(r.correlationId,"C1");assert.equal(r.idempotencyKey,"I1")});
test("P11.15 DB failure cannot leave committed mutation",()=>assert.throws(()=>assertRecoverableFailure({caseType:"DB_FAILURE",mutationCommitted:true,auditCommitted:false,outboxCommitted:false}),/INCONSISTENT/));
test("P11.15 audit failure cannot diverge",()=>assert.throws(()=>assertRecoverableFailure({caseType:"AUDIT_FAILURE",mutationCommitted:true,auditCommitted:false,outboxCommitted:false}),/ATOMICITY/));
test("P11.15 outbox failure cannot diverge",()=>assert.throws(()=>assertRecoverableFailure({caseType:"OUTBOX_FAILURE",mutationCommitted:true,auditCommitted:true,outboxCommitted:false}),/ATOMICITY/));
test("P11.16 report failure is retryable after durable evidence",()=>assert.doesNotThrow(()=>assertRecoverableFailure({caseType:"REPORT_FAILURE",mutationCommitted:true,auditCommitted:true,outboxCommitted:true})));
test("P11.16 replay outcome",()=>assert.equal(recoveryOutcome("REPLAY"),"IDEMPOTENT_REPLAY"));
