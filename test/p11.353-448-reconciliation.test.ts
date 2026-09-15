import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReconciliation, type ReconciliationContract } from "../src/application/p11-353-448-reconciliation.js";

const valid: ReconciliationContract = {
  contractId: "RECON-SYN-001",
  target: "SYNTHETIC",
  observations: [{
    checkpoint: "P11.353-360",
    detaineeId: "DET-SYN-001",
    placement: { detaineeId: "DET-SYN-001", placementId: "ROOM-A", state: "RETURNED" },
    movementEvents: [{ eventId: "MOV-001", detaineeId: "DET-SYN-001", fromPlacementId: null, toPlacementId: "ROOM-A", kind: "TEMPORARY_EXIT_RETURN", headcountDelta: 1 }],
    expectedHeadcount: 1,
    observedHeadcount: 1,
  }],
};

test("P11.353-448 accepts reconciled synthetic placement/headcount", () => assert.equal(evaluateReconciliation(valid), "READY"));
test("P11.353-448 blocks detainee identity drift", () => assert.equal(evaluateReconciliation({ ...valid, observations: [{ ...valid.observations[0], detaineeId: "DET-SYN-002" }] }), "BLOCKED"));
test("P11.353-448 blocks headcount mismatch", () => assert.equal(evaluateReconciliation({ ...valid, observations: [{ ...valid.observations[0], observedHeadcount: 0 }] }), "BLOCKED"));
test("P11.353-448 blocks malformed movement identity", () => assert.equal(evaluateReconciliation({ ...valid, observations: [{ ...valid.observations[0], movementEvents: [{ ...valid.observations[0].movementEvents[0], detaineeId: "DET-SYN-999" }] }] }), "BLOCKED"));
test("P11.353-448 blocks non-synthetic target", () => assert.equal(evaluateReconciliation({ ...valid, target: "NON_PRODUCTION" as "SYNTHETIC" }), "BLOCKED"));
