import test from "node:test";
import assert from "node:assert/strict";
import {
  executeControlledRehearsal,
  SyntheticRepository,
  GOLDEN_STEPS,
} from "../src/application/testing/controlled-nonprod-rehearsal.mjs";

const makeSteps = () => GOLDEN_STEPS.map((type, i) => ({
  stepId: `step-${String(i + 1).padStart(2, "0")}`,
  type,
  subjectId: "synthetic-detainee-001",
}));

test("P10.229 full golden path executes as one controlled rehearsal", () => {
  const repository = new SyntheticRepository();
  const result = executeControlledRehearsal({
    scenarioId: "scenario-001",
    subjectId: "synthetic-detainee-001",
    steps: makeSteps(),
    repository,
  });

  assert.equal(result.status, "REHEARSAL_PASS");
  assert.equal(result.finalState.status, "COMPLETE");
  assert.equal(result.finalState.leaveStatus, "COMPLETED");
  assert.equal(result.auditCount, 10);
  assert.equal(result.outboxCount, 10);
});

test("P10.230 state prerequisites prevent unsafe departure", () => {
  const repository = new SyntheticRepository();
  const steps = makeSteps().map((x) => ({ ...x }));
  steps[6] = { ...steps[6], type: "DEPART" };
  assert.equal(executeControlledRehearsal({
    scenarioId: "scenario-002",
    subjectId: "synthetic-detainee-001",
    steps,
    repository,
  }).status, "REHEARSAL_ROLLED_BACK");
});

test("P10.231 injected failure rolls back all state, audit and outbox changes", () => {
  const repository = new SyntheticRepository();
  const result = executeControlledRehearsal({
    scenarioId: "scenario-003",
    subjectId: "synthetic-detainee-001",
    steps: makeSteps(),
    repository,
    failureAtStep: 7,
  });
  assert.equal(result.status, "REHEARSAL_ROLLED_BACK");
  assert.equal(repository.read("synthetic-detainee-001"), undefined);
  assert.equal(repository.audit.length, 0);
  assert.equal(repository.outbox.length, 0);
});

test("P10.232 identical step replay produces no duplicate mutation", () => {
  const repository = new SyntheticRepository();
  const steps = makeSteps();
  const first = executeControlledRehearsal({
    scenarioId: "scenario-004",
    subjectId: "synthetic-detainee-001",
    steps,
    repository,
  });
  assert.equal(first.status, "REHEARSAL_PASS");

  const second = executeControlledRehearsal({
    scenarioId: "scenario-004",
    subjectId: "synthetic-detainee-001",
    steps,
    repository,
  });
  assert.equal(second.status, "REHEARSAL_PASS");
  assert.equal(repository.audit.length, 10);
  assert.equal(repository.outbox.length, 10);
  assert.equal(second.executed.every((x) => x.result === "REPLAY"), true);
});

test("P10.233 idempotency drift is rejected", () => {
  const repository = new SyntheticRepository();
  const steps = makeSteps();
  executeControlledRehearsal({
    scenarioId: "scenario-005",
    subjectId: "synthetic-detainee-001",
    steps: [steps[0]],
    repository,
  }).catch(() => {});
  const result = executeControlledRehearsal({
    scenarioId: "scenario-005",
    subjectId: "synthetic-detainee-001",
    steps: [{ ...steps[0], type: "ASSIGN_PLACEMENT" }],
    repository,
  });
  assert.equal(result.status, "REHEARSAL_ROLLED_BACK");
});

test("P10.234 audit/outbox counts equal committed domain transitions", () => {
  const repository = new SyntheticRepository();
  executeControlledRehearsal({
    scenarioId: "scenario-006",
    subjectId: "synthetic-detainee-001",
    steps: makeSteps(),
    repository,
  });
  assert.equal(repository.audit.length, repository.outbox.length);
  assert.equal(repository.audit.length, repository.read("synthetic-detainee-001").history.length);
});

test("P10.235 production and external transport remain impossible in the rehearsal result", () => {
  const result = executeControlledRehearsal({
    scenarioId: "scenario-007",
    subjectId: "synthetic-detainee-001",
    steps: makeSteps(),
  });
  assert.equal(result.productionMutation, false);
  assert.equal(result.externalTransport, false);
});

test("P10.236 injected failure cannot leave partial state behind", () => {
  const repository = new SyntheticRepository();
  const result = executeControlledRehearsal({
    scenarioId: "scenario-008",
    subjectId: "synthetic-detainee-001",
    steps: makeSteps(),
    repository,
    failureAtStep: 9,
  });
  assert.equal(result.status, "REHEARSAL_ROLLED_BACK");
  assert.equal(repository.read("synthetic-detainee-001"), undefined);
  assert.equal(repository.audit.length, 0);
  assert.equal(repository.outbox.length, 0);
});
