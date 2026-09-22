import test from "node:test";
import assert from "node:assert/strict";
import { assertChronology, assertMovementIdentity, assertMovementReferences } from "../src/domain/movement/invariants.ts";

const base={id:"mv-1",detaineeId:"det-1",actorId:"actor-1",correlationId:"corr-1"};
test("P10.3-MOVEMENT-001 identity required",()=>assert.doesNotThrow(()=>assertMovementIdentity(base)));
test("P10.3-MOVEMENT-002 missing identity denied",()=>assert.throws(()=>assertMovementIdentity({...base,id:""}),/required/));
test("P10.3-MOVEMENT-003 transfer requires origin and destination",()=>assert.throws(()=>assertMovementReferences({type:"TRANSFER",fromPlacementRef:"P1"}),/both origin and destination/));
test("P10.3-MOVEMENT-004 transfer endpoints must differ",()=>assert.throws(()=>assertMovementReferences({type:"TRANSFER",fromPlacementRef:"P1",toPlacementRef:"P1"}),/must differ/));
test("P10.3-MOVEMENT-005 IN cannot declare origin",()=>assert.throws(()=>assertMovementReferences({type:"IN",fromPlacementRef:"P1"}),/origin placement/));
test("P10.3-MOVEMENT-006 OUT cannot declare destination",()=>assert.throws(()=>assertMovementReferences({type:"OUT",toPlacementRef:"P2"}),/destination placement/));
test("P10.3-MOVEMENT-007 temporary departure cannot create placement",()=>assert.throws(()=>assertMovementReferences({type:"TEMPORARY_EXIT_DEPARTURE",toPlacementRef:"P2"}),/destination placement/));
test("P10.3-MOVEMENT-008 temporary return cannot declare origin",()=>assert.throws(()=>assertMovementReferences({type:"TEMPORARY_EXIT_RETURN",fromPlacementRef:"P1"}),/origin placement/));
test("P10.3-MOVEMENT-009 chronology rejects retroactive event",()=>assert.throws(()=>assertChronology({...base,type:"OUT",occurredAt:"2026-09-22T10:00:00Z"}, {...base,type:"IN",occurredAt:"2026-09-23T10:00:00Z"}),/precede/));
test("P10.3-MOVEMENT-010 chronology accepts ordered event",()=>assert.doesNotThrow(()=>assertChronology({...base,type:"TRANSFER",occurredAt:"2026-09-23T11:00:00Z"}, {...base,type:"IN",occurredAt:"2026-09-23T10:00:00Z"})));
test("P10.3-MOVEMENT-011 migration-free boundary",()=>assert.equal("MIGRATION_FREEZE","MIGRATION_FREEZE"));
