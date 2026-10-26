import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluatePublicationFinalizationGate,
  PUBLICATION_FINALIZATION_GATE_VERSION,
} from "../src/domain/reporting/publication-finalization-gate";

const admitted = {
  publicationId: "pub-001",
  projectionId: "projection-001",
  certificationId: "cert-001",
  sourceFingerprint: "a".repeat(64),
  admissionFingerprint: "b".repeat(64),
  transportFingerprint: '{"publicationId":"pub-001"}',
  syntheticOnly: true as const,
  externalTransport: false as const,
  durablePublication: false as const,
};

test("transport-gated publication cannot be finalized durably", () => {
  const result = evaluatePublicationFinalizationGate(admitted);
  assert.equal(result.version, PUBLICATION_FINALIZATION_GATE_VERSION);
  assert.equal(result.decision, "BLOCKED");
  assert.equal(result.durablePublication, false);
  assert.equal(result.reasonCode, "FINALIZATION_NOT_AUTHORIZED");
});

test("invalid transport identity remains blocked", () => {
  const result = evaluatePublicationFinalizationGate({
    ...admitted,
    externalTransport: true as false,
  });
  assert.equal(result.decision, "BLOCKED");
  assert.equal(result.reasonCode, "TRANSPORT_IDENTITY_INVALID");
});

test("finalization fingerprint is deterministic", () => {
  const first = evaluatePublicationFinalizationGate(admitted);
  const second = evaluatePublicationFinalizationGate(admitted);
  assert.equal(first.finalizationFingerprint, second.finalizationFingerprint);
});
