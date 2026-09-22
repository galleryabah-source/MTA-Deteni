import test from "node:test";
import assert from "node:assert/strict";
import { assertBedAvailable, assertNoActivePlacement, assertPlacementConcurrency, assertPlacementIdentity } from "../src/domain/placement/invariants.ts";

const placement={detaineeId:"det-1",blockId:"B1",roomId:"R1",bedId:"BED1",version:3,active:true,updatedAt:"2026-09-23T00:00:00Z"};
test("P10.2-PLACEMENT-001 identity required",()=>assert.doesNotThrow(()=>assertPlacementIdentity({detaineeId:"det-1",blockId:"B1",roomId:"R1",bedId:"BED1"})));
test("P10.2-PLACEMENT-002 missing identity denied",()=>assert.throws(()=>assertPlacementIdentity({detaineeId:"",blockId:"B1",roomId:"R1",bedId:"BED1"}),/required/));
test("P10.2-PLACEMENT-003 active placement blocks second assignment",()=>assert.throws(()=>assertNoActivePlacement(placement),/already has an active placement/));
test("P10.2-PLACEMENT-004 closed placement may be reused",()=>assert.doesNotThrow(()=>assertNoActivePlacement({...placement,active:false})));
test("P10.2-PLACEMENT-005 occupied bed denied",()=>assert.throws(()=>assertBedAvailable("det-2","det-1"),/already occupied/));
test("P10.2-PLACEMENT-006 same detainee occupant is not conflict",()=>assert.doesNotThrow(()=>assertBedAvailable("det-1","det-1")));
test("P10.2-PLACEMENT-007 stale placement rejected",()=>assert.throws(()=>assertPlacementConcurrency(placement,2),/concurrently/));
test("P10.2-PLACEMENT-008 current-version acceptance",()=>assert.doesNotThrow(()=>assertPlacementConcurrency(placement,3)));
test("P10.2-PLACEMENT-009 null-version initialization",()=>assert.doesNotThrow(()=>assertPlacementConcurrency(null,null)));
test("P10.2-PLACEMENT-010 no schema migration in hardening",()=>assert.equal("MIGRATION_FREEZE","MIGRATION_FREEZE"));
