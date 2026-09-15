import test from "node:test";
import assert from "node:assert/strict";
import { certifyRecoveryJourney } from "../src/application/recovery-certification.js";
import { executeSyntheticRecoveryJourney } from "../src/application/recovery-journey.js";

test("recovery certification proves pre-commit zero effects", () => {
  const journey = executeSyntheticRecoveryJourney({ journeyId: "J-R1", commandId: "C-R1", eventId: "E-R1", correlationId: "X-R1", aggregateId: "DET-R1", expectedVersion: 3, failureClass: "AUTHORIZATION_DENIED", payloadHash: "H-R1" });
  const certification = certifyRecoveryJourney({ ...journey });
  assert.equal(certification.certified, true);
  assert.equal(certification.mutationCount, 0);
  assert.equal(certification.retryCount, 0);
});

test("recovery certification proves post-commit retry deduplication", () => {
  const journey = executeSyntheticRecoveryJourney({ journeyId: "J-R2", commandId: "C-R2", eventId: "E-R2", correlationId: "X-R2", aggregateId: "DET-R2", expectedVersion: 3, failureClass: "OUTBOX_FAILURE", payloadHash: "H-R2" });
  const certification = certifyRecoveryJourney({ ...journey });
  assert.equal(certification.mutationCount, 1);
  assert.equal(certification.auditCount, 1);
  assert.equal(certification.outboxCount, 1);
  assert.equal(certification.retryCount, 2);
});

test("recovery certification rejects duplicate-effect claims", () => {
  const journey = executeSyntheticRecoveryJourney({ journeyId: "J-R3", commandId: "C-R3", eventId: "E-R3", correlationId: "X-R3", aggregateId: "DET-R3", expectedVersion: 3, failureClass: "OUTBOX_FAILURE", payloadHash: "H-R3" });
  assert.throws(() => certifyRecoveryJourney({ ...journey, auditCount: 2 }));
});
