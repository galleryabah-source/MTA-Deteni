import assert from "node:assert/strict";
import test from "node:test";
import { validateEvidenceChain, hasRequiredTemporaryExitEvidence } from "../src/application/workflow/cross-domain-evidence-contract.ts";

const chain={requestId:"REQ",correlationId:"CORR",entries:[
 {evidenceId:"E1",requestId:"REQ",correlationId:"CORR",subjectId:"D1",sourceId:"L1",kind:"LEAVE",occurredAt:"2026-09-21T01:00:00Z",verified:true},
 {evidenceId:"E2",requestId:"REQ",correlationId:"CORR",subjectId:"D1",sourceId:"DOC1",kind:"DOCUMENT",occurredAt:"2026-09-21T01:01:00Z",verified:true},
 {evidenceId:"E3",requestId:"REQ",correlationId:"CORR",subjectId:"D1",sourceId:"ESC1",kind:"ESCORT",occurredAt:"2026-09-21T01:02:00Z",verified:true},
 {evidenceId:"E4",requestId:"REQ",correlationId:"CORR",subjectId:"D1",sourceId:"M1",kind:"MOVEMENT",occurredAt:"2026-09-21T01:03:00Z",verified:true},
 {evidenceId:"E5",requestId:"REQ",correlationId:"CORR",subjectId:"D1",sourceId:"R1",kind:"RETURN",occurredAt:"2026-09-21T02:00:00Z",verified:true},
]};

test("validates one correlated evidence chain",()=>assert.equal(validateEvidenceChain(chain),true));
test("requires all cross-domain evidence kinds",()=>assert.equal(hasRequiredTemporaryExitEvidence(chain),true));
test("rejects mismatched correlation",()=>assert.equal(validateEvidenceChain({...chain,entries:[{...chain.entries[0],correlationId:"OTHER"}]}),false));
test("rejects unverified evidence",()=>assert.equal(validateEvidenceChain({...chain,entries:[{...chain.entries[0],verified:false}]}),false));
test("does not treat partial evidence as complete",()=>assert.equal(hasRequiredTemporaryExitEvidence({...chain,entries:chain.entries.slice(0,2)}),false));
