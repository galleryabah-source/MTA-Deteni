import assert from "node:assert/strict";
import test from "node:test";
import { defaultSyntheticLifecycle, validateLifecycleContract } from "../src/application/p11-161-224-lifecycle-contract.js";

test("P11.161-224 preserves complete temporary-exit lifecycle", () => {
  const events = defaultSyntheticLifecycle();
  assert.equal(validateLifecycleContract({ contractId: "LIFE-001", target: "SYNTHETIC", events }), "READY");
  assert.equal(events[5]?.headcountDelta, -1);
  assert.equal(events[7]?.headcountDelta, 1);
});

test("P11.161-224 blocks departure without temporary-exit QR acceptance", () => {
  const events = defaultSyntheticLifecycle();
  const departure = events[5];
  assert.ok(departure);
  const invalid = events.map((event, index) => index === 5 ? { ...event, outcome: "REJECTED" as const } : event);
  assert.equal(validateLifecycleContract({ contractId: "LIFE-002", target: "SYNTHETIC", events: invalid }), "BLOCKED");
});

test("P11.161-224 blocks lifecycle target drift", () => {
  const events = defaultSyntheticLifecycle();
  assert.equal(validateLifecycleContract({ contractId: "LIFE-003", target: "NON_PRODUCTION" as never, events }), "BLOCKED");
});
