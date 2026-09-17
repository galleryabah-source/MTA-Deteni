import assert from "node:assert/strict";
import {
  admitPublicationRequest,
  resetPublicationRequestAdmissionRegistry,
} from "../src/application/p13-16441-16560-publication-request-admission.js";

const base = {
  requestId: "REQ-1",
  publicationRequestId: "PUB-1",
  publicationFingerprint: "FP-1",
  projectionId: "PROJ-1",
  certificationId: "CERT-1",
  readinessState: "READY_FOR_PUBLICATION" as const,
  syntheticOnly: true as const,
};

resetPublicationRequestAdmissionRegistry();
const admitted = admitPublicationRequest(base);
assert.equal(admitted.state, "ADMITTED");
assert.equal(admitted.reason, "NEW_REQUEST");
assert.equal(admitted.externalTransportAllowed, false);
assert.equal(admitted.durablePublicationAllowed, false);

const replay = admitPublicationRequest(base);
assert.equal(replay.state, "REPLAY");
assert.equal(replay.reason, "IDEMPOTENT_REPLAY");

const conflict = admitPublicationRequest({ ...base, publicationFingerprint: "FP-DRIFT" });
assert.equal(conflict.state, "CONFLICT");
assert.equal(conflict.reason, "FINGERPRINT_CONFLICT");

const notReady = admitPublicationRequest({ ...base, publicationRequestId: "PUB-2", readinessState: "READY_FOR_PUBLICATION" });
assert.equal(notReady.state, "ADMITTED");

console.log("P13.16441-16560 publication request admission tests: PASS");
