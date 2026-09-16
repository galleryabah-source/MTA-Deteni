import test from "node:test";
import assert from "node:assert/strict";
import { assertExpectedVersion, nextAggregateVersion, resolveOptimisticConcurrency } from "../src/application/optimistic-concurrency-contract.js";

test("optimistic concurrency accepts the exact expected version", () => {
  assert.equal(resolveOptimisticConcurrency({ aggregateId: "d-001", version: 3 }, 3), "ACCEPT");
  assert.doesNotThrow(() => assertExpectedVersion({ aggregateId: "d-001", version: 3 }, 3));
});

test("optimistic concurrency rejects stale versions deterministically", () => {
  assert.equal(resolveOptimisticConcurrency({ aggregateId: "d-001", version: 4 }, 3), "STALE_VERSION");
  assert.throws(() => assertExpectedVersion({ aggregateId: "d-001", version: 4 }, 3), /STALE_VERSION/);
});

test("next version is immutable and increments exactly once", () => {
  const next = nextAggregateVersion({ aggregateId: "d-001", version: 7 });
  assert.deepEqual(next, { aggregateId: "d-001", version: 8 });
  assert.equal(Object.isFrozen(next), true);
});

test("invalid version input fails closed", () => {
  assert.throws(() => resolveOptimisticConcurrency({ aggregateId: "d-001", version: 1 }, -1), /non-negative integer/);
  assert.throws(() => resolveOptimisticConcurrency({ aggregateId: "d-001", version: -1 }, 0), /non-negative integer/);
});
