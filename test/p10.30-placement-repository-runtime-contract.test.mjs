import assert from "node:assert/strict"; import {test} from "node:test";
const u=new URL("../src/infrastructure/database/placement-repository-runtime-contract.ts",import.meta.url);
test("P10.30 maps placement to observed production table",async()=>{const m=await import(u);assert.equal(m.PLACEMENT_TABLE,"public.mta_placements");assert.equal(m.PLACEMENT_COLUMN_MAP.detaineeId,"detainee_id");});
test("P10.30 preserves repository boundary",async()=>{const m=await import(u);assert.ok(m.PLACEMENT_REPOSITORY_RUNTIME_CONTRACT_VERSION);});
