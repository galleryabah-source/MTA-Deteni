import test from "node:test";
import assert from "node:assert/strict";
import { admitPublication, fingerprintAdmission, PUBLICATION_ADMISSION_VERSION } from "../src/domain/reporting/publication-admission";

const certification = {
  publicationId: "PUB-001",
  readinessState: "READY_FOR_PUBLICATION" as const,
  projectionId: "PROJ-001",
  certificationId: "CERT-001",
  sourceFingerprint: "SRC-001",
  syntheticOnly: true as const
};

const request = {
  requestId: "REQ-001",
  publicationId: "PUB-001",
  projectionId: "PROJ-001",
  certificationId: "CERT-001",
  sourceFingerprint: "SRC-001",
  requestedAt: "2026-09-21T00:00:00.000Z",
  syntheticOnly: true as const
};

test("admits only exact certified synthetic identity", () => {
  const result = admitPublication(certification, request);
  assert.equal(result.version, PUBLICATION_ADMISSION_VERSION);
  assert.equal(result.decision, "ADMIT");
  assert.equal(result.externalTransport, false);
  assert.equal(result.durablePublication, false);
  assert.equal(result.admissionFingerprint.length, 64);
});

test("same request is deterministic and becomes REPLAY", () => {
  const first = admitPublication(certification, request);
  const replay = admitPublication(certification, request, first);
  assert.equal(replay.decision, "REPLAY");
  assert.equal(replay.admissionFingerprint, first.admissionFingerprint);
});

test("identity drift is rejected", () => {
  assert.throws(
    () => admitPublication(certification, { ...request, projectionId: "PROJ-DRIFT" }),
    /PROJECTION_ID_DRIFT/
  );
});

test("non-synthetic state is rejected", () => {
  assert.throws(
    () => admitPublication(certification, { ...request, syntheticOnly: false as never }),
    /NON_SYNTHETIC_STATE/
  );
});

test("not-ready certification is rejected", () => {
  assert.throws(
    () => admitPublication({ ...certification, readinessState: "NOT_READY" as never }, request),
    /CERTIFICATION_NOT_READY/
  );
});

test("conflicting prior admission returns CONFLICT without overwriting prior material", () => {
  const first = admitPublication(certification, request);
  const conflict = admitPublication(certification, { ...request, requestId: "REQ-002" }, first);
  assert.equal(conflict.decision, "CONFLICT");
  assert.notEqual(conflict.admissionFingerprint, first.admissionFingerprint);
  assert.equal(first.requestId, "REQ-001");
});

test("admission fingerprint is stable for the same material", () => {
  const first = admitPublication(certification, request);
  const material = { ...first };
  delete (material as Partial<typeof first>).admissionFingerprint;
  assert.equal(fingerprintAdmission(material), first.admissionFingerprint);
});
