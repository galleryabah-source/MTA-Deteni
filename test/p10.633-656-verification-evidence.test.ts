import assert from "node:assert/strict";
import test from "node:test";
import { createSyntheticEvidence, evaluateEvidencePacket } from "../src/application/verification-evidence.js";

test("P10.633-640 synthetic evidence packet is deterministic and ready when all controls pass", () => {
  const controls = [
    createSyntheticEvidence("P10.609-616", "schema-reconciliation"),
    createSyntheticEvidence("P10.609-616", "rls-reconciliation"),
    createSyntheticEvidence("P10.617-624", "persistence-invariants"),
    createSyntheticEvidence("P10.625-632", "runtime-transport-e2e"),
  ];
  assert.equal(evaluateEvidencePacket({ packetId: "SYN-PACKET-001", generatedAt: new Date(0).toISOString(), target: "SYNTHETIC", controls }), "READY");
  assert.equal(controls[0].id, "SYN-P10-609-616-schema-reconciliation");
});

test("evidence packet blocks empty or incomplete verification", () => {
  assert.equal(evaluateEvidencePacket({ packetId: "EMPTY", generatedAt: new Date(0).toISOString(), target: "SYNTHETIC", controls: [] }), "BLOCKED");
  assert.equal(evaluateEvidencePacket({ packetId: "FAIL", generatedAt: new Date(0).toISOString(), target: "SYNTHETIC", controls: [createSyntheticEvidence("P10.633-640", "control", "FAIL")] }), "BLOCKED");
});

test("non-production packet cannot mix synthetic evidence", () => {
  assert.equal(evaluateEvidencePacket({
    packetId: "MIXED",
    generatedAt: new Date(0).toISOString(),
    target: "NON_PRODUCTION",
    controls: [createSyntheticEvidence("P10.633-640", "control")],
  }), "BLOCKED");
});
