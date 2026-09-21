import assert from "node:assert/strict";
import test from "node:test";
import { validateWorkflowEvidence } from "../src/application/workflow/workflow-evidence-contract.ts";

const valid={evidenceId:"EV-1",requestId:"REQ-1",type:"STATE_TRANSITION",subjectId:"DET-1",sourceId:"LEAVE-1",occurredAt:"2026-09-21T07:00:00Z",verified:true,correlationId:"CORR-1"};

test("accepts complete workflow evidence",()=>assert.equal(validateWorkflowEvidence(valid),"ACCEPTED"));
test("rejects evidence without identity",()=>assert.equal(validateWorkflowEvidence({...valid,sourceId:""}),"REJECTED"));
test("rejects invalid timestamp",()=>assert.equal(validateWorkflowEvidence({...valid,occurredAt:"invalid"}),"REJECTED"));
