import test from "node:test";
import assert from "node:assert/strict";
import {
  composeScenarioEvidencePacket,
  verifyScenarioEvidencePacket,
  REQUIRED_EVIDENCE,
} from "../src/application/testing/scenario-evidence-packet.mjs";

const input = {
  scenarioId: "scenario-001",
  subjectId: "synthetic-detainee-001",
  manifestFingerprint: "a".repeat(64),
  readinessFingerprint: "b".repeat(64),
  syntheticOnly: true,
  events: REQUIRED_EVIDENCE.map((type, i) => ({
    eventId: `event-${i + 1}`,
    type,
    subjectId: "synthetic-detainee-001",
    sourceId: `source-${i + 1}`,
    verified: true,
  })),
};

test("P10.213 evidence packet requires both upstream fingerprints", () => {
  assert.throws(() => composeScenarioEvidencePacket({ ...input, manifestFingerprint: "" }), /MANIFEST_FINGERPRINT_REQUIRED/);
  assert.throws(() => composeScenarioEvidencePacket({ ...input, readinessFingerprint: "" }), /READINESS_FINGERPRINT_REQUIRED/);
});

test("P10.214 evidence sequence covers the complete golden path", () => {
  const packet = composeScenarioEvidencePacket(input);
  assert.deepEqual(packet.events.map((x) => x.type), REQUIRED_EVIDENCE);
});

test("P10.215 duplicate evidence identity is rejected", () => {
  const events = [...input.events];
  events[1] = { ...events[1], eventId: events[0].eventId };
  assert.throws(() => composeScenarioEvidencePacket({ ...input, events }), /EVIDENCE_EVENT_ID_DUPLICATE/);
});

test("P10.216 subject identity cannot drift across events", () => {
  const events = [...input.events];
  events[7] = { ...events[7], subjectId: "other-subject" };
  assert.throws(() => composeScenarioEvidencePacket({ ...input, events }), /EVIDENCE_SUBJECT_MISMATCH/);
});

test("P10.217 packet fingerprint is deterministic", () => {
  const a = composeScenarioEvidencePacket(input);
  const b = composeScenarioEvidencePacket(input);
  assert.equal(a.packetFingerprint, b.packetFingerprint);
});

test("P10.218 tampering is detected", () => {
  const packet = composeScenarioEvidencePacket(input);
  assert.equal(verifyScenarioEvidencePacket(packet), true);
  assert.equal(verifyScenarioEvidencePacket({ ...packet, readinessFingerprint: "c".repeat(64) }), false);
});

test("P10.219 synthetic-only boundary remains explicit", () => {
  assert.throws(() => composeScenarioEvidencePacket({ ...input, syntheticOnly: false }), /EVIDENCE_MUST_BE_SYNTHETIC/);
});

test("P10.220 production mutation and external transport remain disabled", () => {
  const packet = composeScenarioEvidencePacket(input);
  assert.equal(packet.controls.productionMutation, false);
  assert.equal(packet.controls.externalTransport, false);
});
