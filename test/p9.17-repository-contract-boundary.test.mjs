import assert from "node:assert/strict";
import test from "node:test";
import { validateRepositoryMutationContext } from "../src/infrastructure/database/repository-contract.ts";

test("complete mutation context is accepted",()=>{
 assert.equal(validateRepositoryMutationContext({
  transactionId:"TX",requestId:"REQ",correlationId:"CORR",actorId:"USER",policyVersion:"P9.4-v1"
 }),true);
});

test("missing actor is rejected",()=>{
 assert.equal(validateRepositoryMutationContext({
  transactionId:"TX",requestId:"REQ",correlationId:"CORR",actorId:"",policyVersion:"P9.4-v1"
 }),false);
});

test("missing policy version is rejected",()=>{
 assert.equal(validateRepositoryMutationContext({
  transactionId:"TX",requestId:"REQ",correlationId:"CORR",actorId:"USER",policyVersion:""
 }),false);
});
