import assert from "node:assert/strict"; import {test} from "node:test";
const u=new URL("../src/infrastructure/database/integrated-runtime-repository-adapter.ts",import.meta.url);

const ctx={transactionId:"tx-1",requestId:"req-1",correlationId:"corr-1",actorId:"actor-1",policyVersion:"p1"};

test("P10.34 rejects incomplete runtime repository context",async()=>{
 const {createIntegratedRuntimeRepositories}=await import(u);
 assert.throws(()=>createIntegratedRuntimeRepositories({},{...ctx,actorId:""}),"RUNTIME_REPOSITORY_CONTEXT_INVALID");
});
test("P10.34 accepts one governed repository composition",async()=>{
 const {createIntegratedRuntimeRepositories}=await import(u);
 const repositories={detainee:{},placement:{},movement:{},leave:{},document:{}};
 assert.equal(createIntegratedRuntimeRepositories(repositories,ctx),repositories);
});
