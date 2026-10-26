import assert from "node:assert/strict"; import {test} from "node:test";
const u=new URL("../src/infrastructure/database/movement-repository-runtime-contract.ts",import.meta.url);
test("P10.31 maps movement to observed production table",async()=>{const m=await import(u);assert.equal(m.MOVEMENT_TABLE,"public.mta_movements");assert.equal(m.MOVEMENT_COLUMN_MAP.movementType,"movement_type");assert.equal(m.MOVEMENT_COLUMN_MAP.occurredAt,"occurred_at");});
test("P10.31 exposes append-oriented movement repository",async()=>{const m=await import(u);assert.ok(m.MovementRepositoryPort);});
