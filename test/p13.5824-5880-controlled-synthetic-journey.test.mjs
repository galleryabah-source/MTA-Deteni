import test from "node:test";
import assert from "node:assert/strict";
import { TEMPORARY_EXIT_TRANSITIONS, canTransition, transition } from "../src/domain/temporary-exit/state-machine.mjs";

test("P13.5824 temporary-exit happy path is deterministic", () => {
  const expected = [
    "REQUESTED",
    "VALIDATED",
    "APPROVED",
    "DOCUMENTED",
    "ESCORT_ASSIGNED",
    "DEPARTED",
    "RETURN_PENDING",
    "RETURNED",
    "COMPLETED",
  ];

  let state = expected[0];
  for (const next of expected.slice(1)) {
    assert.equal(canTransition(state, next), true, `${state} -> ${next}`);
    const result = transition(state, next);
    assert.deepEqual(result, { ok: true, state: next });
    state = result.state;
  }
  assert.equal(state, "COMPLETED");
});

test("P13.5825 temporary-exit rejects skipped or reversed transitions", () => {
  assert.equal(canTransition("REQUESTED", "APPROVED"), false);
  assert.equal(canTransition("DEPARTED", "APPROVED"), false);
  assert.equal(canTransition("COMPLETED", "RETURN_PENDING"), false);
  assert.deepEqual(transition("REQUESTED", "APPROVED"), {
    ok: false,
    code: "INVALID_STATE",
    from: "REQUESTED",
    to: "APPROVED",
  });
});

test("P13.5826 transition graph has no accidental terminal escape", () => {
  assert.deepEqual(TEMPORARY_EXIT_TRANSITIONS.COMPLETED, []);
  assert.equal(Object.keys(TEMPORARY_EXIT_TRANSITIONS).length, 9);
});
