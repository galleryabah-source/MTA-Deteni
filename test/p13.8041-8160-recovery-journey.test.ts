import test from "node:test";
import assert from "node:assert/strict";
import { executeSyntheticRecoveryJourney } from "../src/application/recovery-journey.js";
import { createFailureRecoveryCase } from "../src/application/failure-recovery-contract.js";
import { createRecoveryEvidence } from "../src/application/recovery-evidence.js";

const base = {
  journeyId: "J-001",
  commandId: "CMD-001",
  requestHash: "REQUEST-HASH-001",
  eventId: "EVT-001",
  correlationId: "CORR-001",
  aggregateId: "DET-001",
  expectedVersion: 4,
  payloadHash: "PAYLOAD-FP-001",
};

test("pre-commit recovery has zero mutation, audit and outbox effects", () => {
  for (const failureClass of ["AUTHORIZATION_DENIED", "STALE_VERSION", "IDEMPOTENCY_CONFLICT", "REPOSITORY_CONFLICT"] as const) {
    const result = executeSyntheticRecoveryJourney({ ...base, failureClass });
    assert.equal(result.mutationCount, 0);
    assert.equal(result.auditCount, 0);
    assert.equal(result.outboxCount, 0);
    assert.equal(result.retryRecords.length, 0);
  }
});

test("post-commit infrastructure recovery advances once and deduplicates retry", () => {
  for (const failureClass of ["OUTBOX_FAILURE", "PROJECTION_REFRESH_FAILURE"] as const) {
    const result = executeSyntheticRecoveryJourney({ ...base, failureClass });
    assert.equal(result.outcome, "RECOVERED");
    assert.equal(result.mutationCount, 1);
    assert.equal(result.auditCount, 1);
    assert.equal(result.outboxCount, 1);
    assert.deepEqual(result.retryRecords.map((item) => item.decision), ["RETRY", "SKIP_DUPLICATE"]);
    assert.equal(result.evidence[0]?.resultingVersion, 5);
  }
});

test("offline reconnect conflict is forced into review", () => {
  const result = executeSyntheticRecoveryJourney({
    ...base,
    failureClass: "OUTBOX_FAILURE",
    reconnectCommand: {
      commandId: "OFF-001",
      aggregateId: "DET-001",
      commandType: "MOVEMENT_RECORD",
      payloadHash: "HASH-OFF",
      idempotencyKey: "IDEMP-OFF",
      createdAt: "2026-09-15T00:00:00Z",
      state: "PENDING",
    },
  });
  assert.equal(result.outcome, "RECONNECT_REVIEW");
});

test("recovery evidence preserves canonical failure semantics and request-hash separation", () => {
  const failure = createFailureRecoveryCase("STALE_VERSION");
  const evidence = createRecoveryEvidence({
    ...base,
    evidenceId: "REC-001",
    expectedVersion: 4,
    resultingVersion: 4,
    failureClass: failure.failureClass,
    reasonCode: failure.reasonCode,
    terminalState: failure.terminalState,
    recovery: failure.recovery,
    mutationCommitted: failure.mutationCommitted,
    retrySafe: failure.retrySafe,
    compensationAllowed: failure.compensationAllowed,
  });
  assert.equal(evidence.syntheticOnly, true);
  assert.throws(() => createRecoveryEvidence({ ...evidence, resultingVersion: 5 }));
  assert.throws(() => createRecoveryEvidence({ ...evidence, requestHash: evidence.commandId }));
});
