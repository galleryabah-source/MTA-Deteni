import assert from "node:assert/strict";
import test from "node:test";
import {
  assertStateMutationAuditBinding,
  certifyDetaineeStateMachine,
  certifyTemporaryExitStateMachine,
  DETAINEE_TRANSITIONS,
  TEMPORARY_EXIT_TRANSITIONS,
} from "../src/application/state-machine-certification.js";

test("state machine certification accepts canonical detainee lifecycle and terminal closure", () => {
  const result = certifyDetaineeStateMachine({
    correlationId: "CORR-STATE-1",
    path: ["ACTIVE", "TRANSFERRED", "DEPARTED", "CLOSED"],
    rejectedAttempts: [
      { from: "CLOSED", to: "ACTIVE", allowed: false, outcome: "REJECTED", versionBefore: 3, versionAfter: 3, correlationId: "CORR-STATE-1", mutationId: "MUT-REJECT-1" },
    ],
  });
  assert.equal(result.certified, true);
  assert.equal(result.terminalStates[0], "CLOSED");
});

test("state machine certification accepts complete temporary-exit lifecycle", () => {
  const result = certifyTemporaryExitStateMachine({
    correlationId: "CORR-STATE-2",
    path: ["REQUESTED", "VALIDATED", "APPROVED", "DOCUMENTED", "ESCORT_ASSIGNED", "DEPARTED", "RETURN_PENDING", "RETURNED", "COMPLETED"],
    rejectedAttempts: [
      { from: "REQUESTED", to: "APPROVED", allowed: false, outcome: "REJECTED", versionBefore: 0, versionAfter: 0, correlationId: "CORR-STATE-2", mutationId: "MUT-REJECT-2" },
      { from: "COMPLETED", to: "RETURNED", allowed: false, outcome: "REJECTED", versionBefore: 8, versionAfter: 8, correlationId: "CORR-STATE-2", mutationId: "MUT-REJECT-3" },
    ],
  });
  assert.equal(result.certified, true);
  assert.equal(result.terminalStates[0], "COMPLETED");
});

test("illegal bypass, reverse, self-loop and version advance fail closed", () => {
  assert.equal(DETAINEE_TRANSITIONS.ACTIVE.includes("CLOSED"), true);
  assert.equal(TEMPORARY_EXIT_TRANSITIONS.REQUESTED.includes("APPROVED"), false);
  assert.throws(() => certifyTemporaryExitStateMachine({
    correlationId: "CORR-STATE-3",
    path: ["REQUESTED", "APPROVED"],
    rejectedAttempts: [],
  }));
  assert.throws(() => certifyDetaineeStateMachine({
    correlationId: "CORR-STATE-4",
    path: ["ACTIVE", "TRANSFERRED", "ACTIVE"],
    rejectedAttempts: [],
  }));
  assert.throws(() => certifyTemporaryExitStateMachine({
    correlationId: "CORR-STATE-5",
    path: ["REQUESTED", "VALIDATED", "APPROVED", "DOCUMENTED", "ESCORT_ASSIGNED", "DEPARTED", "RETURN_PENDING", "RETURNED", "COMPLETED"],
    rejectedAttempts: [
      { from: "COMPLETED", to: "RETURNED", allowed: false, outcome: "REJECTED", versionBefore: 8, versionAfter: 9, correlationId: "CORR-STATE-5", mutationId: "MUT-REJECT-4" },
    ],
  }));
});

test("state transition audit must bind correlation and mutation identity", () => {
  const attempt = { from: "REQUESTED" as const, to: "VALIDATED" as const, allowed: true, outcome: "APPLIED" as const, versionBefore: 0, versionAfter: 1, correlationId: "CORR-STATE-6", mutationId: "MUT-1" };
  assert.doesNotThrow(() => assertStateMutationAuditBinding({
    attempt, auditCorrelationId: "CORR-STATE-6", auditMutationId: "MUT-1", auditFrom: "REQUESTED", auditTo: "VALIDATED",
  }));
  assert.throws(() => assertStateMutationAuditBinding({
    attempt, auditCorrelationId: "CORR-OTHER", auditMutationId: "MUT-1", auditFrom: "REQUESTED", auditTo: "VALIDATED",
  }));
});
