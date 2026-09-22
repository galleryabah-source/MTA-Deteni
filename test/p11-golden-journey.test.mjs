import test from "node:test";import assert from "node:assert/strict";import {assertGoldenEvent,assertGoldenSequence,assertReplayStable,buildUnifiedFinal,GOLDEN_STAGES} from "../src/application/p11-runtime-golden-journey.ts";
const mk=(stage)=>({stage,journeyId:"J1",requestId:"R1",correlationId:"C1",idempotencyKey:"I1",resourceId:"D1",status:"SUCCESS"});
test("P11.5-11.11 complete golden journey",()=>{const e=GOLDEN_STAGES.map(mk);e.forEach(assertGoldenEvent);assert.equal(assertGoldenSequence(e),true);const f=buildUnifiedFinal(e,{auditIds:["A1"],outboxIds:["O1"],reportId:"REP1"});assert.equal(f.finalized,true)});
test("P11.12 replay is stable",()=>assert.doesNotThrow(()=>assertReplayStable(mk("MUTATION"),mk("MUTATION"))));
test("P11.12 replay mismatch rejected",()=>assert.throws(()=>assertReplayStable(mk("MUTATION"),{...mk("MUTATION"),idempotencyKey:"I2"}),/MISMATCH/));
test("P11 failure incomplete journey rejected",()=>assert.throws(()=>assertGoldenSequence(GOLDEN_STAGES.slice(0,4).map(mk)),/INCOMPLETE/));
test("P11 duplicate evidence rejected",()=>assert.throws(()=>buildUnifiedFinal(GOLDEN_STAGES.map(mk),{auditIds:["A1","A1"],outboxIds:["O1"],reportId:"R"}),/DUPLICATE/));
