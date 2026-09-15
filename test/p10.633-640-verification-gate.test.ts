import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTROLLED_NONPROD_CONTROLS, evaluateControlledGate, assertControlledGate } from "../src/application/verification-gate.js";
import { createSyntheticEvidence } from "../src/application/verification-evidence.js";

const complete = () => ({
  packetId: "SYN-PACKET-001",
  generatedAt: "1970-01-01T00:00:00.000Z",
  target: "SYNTHETIC" as const,
  controls: CONTROLLED_NONPROD_CONTROLS.map((control) => createSyntheticEvidence("P10.633", control)),
});

test("complete synthetic evidence packet is gate-ready", () => {
  const packet = complete();
  assert.equal(evaluateControlledGate(packet), "READY");
  assert.doesNotThrow(() => assertControlledGate(packet));
});

test("missing or failed evidence blocks the gate", () => {
  const packet = complete();
  assert.equal(evaluateControlledGate({ ...packet, controls: packet.controls.slice(1) }), "BLOCKED");
  assert.equal(evaluateControlledGate({ ...packet, controls: packet.controls.map((item, index) => index === 0 ? { ...item, status: "FAIL" as const } : item) }), "BLOCKED");
});
