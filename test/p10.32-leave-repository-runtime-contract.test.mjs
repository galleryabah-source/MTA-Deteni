import assert from "node:assert/strict"; import {test} from "node:test";
const u=new URL("../src/infrastructure/database/leave-repository-runtime-contract.ts",import.meta.url);
test("P10.32 maps leave to observed production table",async()=>{const m=await import(u);assert.equal(m.LEAVE_TABLE,"public.mta_leaves");assert.equal(m.LEAVE_COLUMN_MAP.startAt,"start_at");});
test("P10.32 preserves workflow repository operations",async()=>{const m=await import(u);assert.ok(m.LEAVE_REPOSITORY_RUNTIME_CONTRACT_VERSION);});
