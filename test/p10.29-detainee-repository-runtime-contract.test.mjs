import assert from "node:assert/strict";
import { test } from "node:test";
const u=new URL("../src/infrastructure/database/detainee-repository-runtime-contract.ts",import.meta.url);

test("P10.29 maps detainee domain to actual production table",async()=>{
 const m=await import(u);
 assert.equal(m.DETAINEE_TABLE,"public.mta_detainees");
 assert.equal(m.DETAINEE_COLUMN_MAP.createdAt,"created_at");
 assert.equal(m.DETAINEE_COLUMN_MAP.updatedAt,"updated_at");
});
test("P10.29 exposes read and mutation repository ports",async()=>{
 const m=await import(u);
 for(const key of ["getById","getByCode","insert","update"]) assert.ok(key);
 assert.ok(m.DETAINEE_REPOSITORY_RUNTIME_CONTRACT_VERSION);
});
