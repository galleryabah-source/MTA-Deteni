import assert from "node:assert/strict";
import test from "node:test";
import { validateMutationContext } from "../src/application/persistence/domain-persistence-boundary.ts";

const context={transactionId:"TX-1",requestId:"REQ-1",correlationId:"CORR-1",actorId:"USER-1",policyVersion:"P10.20-v1"};

test("complete mutation context is accepted",()=>assert.doesNotThrow(()=>validateMutationContext(context)));
test("missing transaction identity is rejected",()=>assert.throws(()=>validateMutationContext({...context,transactionId:""}),/MUTATION_CONTEXT_TRANSACTIONID_REQUIRED/));
test("missing correlation identity is rejected",()=>assert.throws(()=>validateMutationContext({...context,correlationId:""}),/MUTATION_CONTEXT_CORRELATIONID_REQUIRED/));
test("missing actor identity is rejected",()=>assert.throws(()=>validateMutationContext({...context,actorId:""}),/MUTATION_CONTEXT_ACTORID_REQUIRED/));
