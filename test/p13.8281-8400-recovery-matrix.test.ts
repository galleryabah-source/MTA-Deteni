import test from "node:test";
import assert from "node:assert/strict";
import { executeSyntheticRecoveryJourney } from "../src/application/recovery-journey.js";
import { certifyRecoveryJourney } from "../src/application/recovery-certification.js";

const reconnectCommand = {
  commandId: "OFF-MATRIX",
  aggregateId: "DET-MATRIX",
  commandType: "MOVEMENT_RECORD",
  payloadHash: "OFF-HASH",
  idempotencyKey: "OFF-IDEMP",
  createdAt: "2026-09-15T00:00:00Z",
  state: "PENDING" as const,
};

const base = {
  journeyId: "J-MATRIX",
  commandId: "CMD-MATRIX",
  eventId: "EVT-MATRIX",
  correlationId: "CORR-MATRIX",
  aggregateId: "DET-MATRIX",
  expectedVersion: 7,
  payloadHash: "PAYLOAD-FP-MATRIX",
};

const failures = [
  "AUTHORIZATION_DENIED",
  "STALE_VERSION",
  "IDEMPOTENCY_CONFLICT",
  "REPOSITORY_CONFLICT",
  "OUTBOX_FAILURE",
  "PROJECTION_REFRESH_FAILURE",
  "OFFLINE_RECONNECT_CONFLICT",
] as const;

test("all seven governed failure classes execute through the synthetic recovery journey", () => {
  for (const failureClass of failures) {
    const result = executeSyntheticRecoveryJourney({
      ...base,
      failureClass,
      reconnectCommand: failureClass === "OFFLINE_RECONNECT_CONFLICT" ? reconnectCommand : undefined,
    });
    assert.equal(result.syntheticOnly, true);
    if (failureClass === "OUTBOX_FAILURE" || failureClass === "PROJECTION_REFRESH_FAILURE") {
      assert.equal(result.outcome, "RECOVERED");
      assert.equal(result.mutationCount, 1);
    } else if (failureClass === "OFFLINE_RECONNECT_CONFLICT") {
      assert.equal(result.outcome, "RECONNECT_REVIEW");
      assert.equal(result.mutationCount, 0);
    } else {
      assert.ok(result.outcome === "REJECTED" || result.outcome === "REVIEW_REQUIRED");
      assert.equal(result.mutationCount, 0);
    }
    const certification = certifyRecoveryJourney({ ...result });
    assert.equal(certification.certified, true);
  }
});
