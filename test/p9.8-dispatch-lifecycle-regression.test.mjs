import test from "node:test";
import assert from "node:assert/strict";

/**
 * Deterministic repository-only model of the LIVE P9.8 dispatcher RPC boundary.
 *
 * This is deliberately a test harness, not a second production outbox
 * implementation. It models the verified production transitions:
 * PENDING -> PROCESSING -> PUBLISHED
 * PROCESSING -> PENDING on release/retry.
 *
 * The current production claim RPC records lockedAt but does not calculate
 * lease expiry. The stale-lease test therefore asserts the observed behavior
 * instead of inventing automatic recovery.
 */
class DispatcherHarness {
  #events = new Map();
  #locked = new Set();
  #clock = 0;

  seed(eventId, availableAt = 0) {
    this.#events.set(eventId, {
      event_id: eventId,
      status: "PENDING",
      attempts: 0,
      available_at: availableAt,
      locked_at: null,
      published_at: null,
      last_error: null,
    });
  }

  snapshot(eventId) {
    return structuredClone(this.#events.get(eventId));
  }

  claim(limit = 25) {
    const claimed = [];
    for (const event of this.#events.values()) {
      if (claimed.length >= limit) break;
      if (event.status !== "PENDING" || event.available_at > this.#clock) continue;
      if (this.#locked.has(event.event_id)) continue;

      // Mirrors FOR UPDATE SKIP LOCKED: the row becomes owned before the
      // next claimant can observe it as claimable.
      this.#locked.add(event.event_id);
      event.status = "PROCESSING";
      event.attempts += 1;
      event.locked_at = this.#clock;
      claimed.push(this.snapshot(event.event_id));
    }
    return claimed;
  }

  release(eventId, error, backoffSeconds) {
    const event = this.#events.get(eventId);
    assert.ok(event);
    assert.equal(event.status, "PROCESSING");
    event.status = "PENDING";
    event.available_at = this.#clock + backoffSeconds;
    event.locked_at = null;
    event.last_error = error;
    this.#locked.delete(eventId);
  }

  complete(eventId) {
    const event = this.#events.get(eventId);
    assert.ok(event);
    assert.equal(event.status, "PROCESSING");
    event.status = "PUBLISHED";
    event.published_at = this.#clock;
    event.locked_at = null;
    event.last_error = null;
    this.#locked.delete(eventId);
  }

  advance(seconds) {
    this.#clock += seconds;
  }
}

test("P9.8 claim concurrency admits one active claimant", () => {
  const queue = new DispatcherHarness();
  queue.seed("evt-001");

  const first = queue.claim(1);
  const second = queue.claim(1);

  assert.deepEqual(first.map((e) => e.event_id), ["evt-001"]);
  assert.deepEqual(second, []);
  assert.equal(queue.snapshot("evt-001").status, "PROCESSING");
  assert.equal(queue.snapshot("evt-001").attempts, 1);
});

test("P9.8 concurrent workers cannot double-increment attempts", () => {
  const queue = new DispatcherHarness();
  queue.seed("evt-001");

  const workers = Array.from({ length: 16 }, () => queue.claim(1));
  const winners = workers.flat();

  assert.equal(winners.length, 1);
  assert.equal(queue.snapshot("evt-001").attempts, 1);
});

test("P9.8 retry release returns PROCESSING to PENDING with bounded scheduling evidence", () => {
  const queue = new DispatcherHarness();
  queue.seed("evt-001");

  const [claimed] = queue.claim(1);
  assert.equal(claimed.status, "PROCESSING");

  queue.release("evt-001", "SYNTHETIC_PROVIDER_TIMEOUT", 60);
  const released = queue.snapshot("evt-001");

  assert.equal(released.status, "PENDING");
  assert.equal(released.last_error, "SYNTHETIC_PROVIDER_TIMEOUT");
  assert.equal(released.locked_at, null);
  assert.equal(released.available_at, 60);
  assert.equal(released.attempts, 1);
});

test("P9.8 retry is not claimable before available_at", () => {
  const queue = new DispatcherHarness();
  queue.seed("evt-001");

  queue.claim(1);
  queue.release("evt-001", "SYNTHETIC_RETRY", 60);

  assert.deepEqual(queue.claim(1), []);

  queue.advance(59);
  assert.deepEqual(queue.claim(1), []);

  queue.advance(1);
  const retry = queue.claim(1);

  assert.equal(retry.length, 1);
  assert.equal(retry[0].status, "PROCESSING");
  assert.equal(retry[0].attempts, 2);
});

test("P9.8 successful completion is PROCESSING to PUBLISHED and clears lease/error", () => {
  const queue = new DispatcherHarness();
  queue.seed("evt-001");

  queue.claim(1);
  queue.complete("evt-001");

  const completed = queue.snapshot("evt-001");
  assert.equal(completed.status, "PUBLISHED");
  assert.equal(completed.published_at, 0);
  assert.equal(completed.locked_at, null);
  assert.equal(completed.last_error, null);
  assert.equal(completed.attempts, 1);
});

test("P9.8 published events cannot be claimed again", () => {
  const queue = new DispatcherHarness();
  queue.seed("evt-001");

  queue.claim(1);
  queue.complete("evt-001");

  assert.deepEqual(queue.claim(1), []);
  assert.equal(queue.snapshot("evt-001").attempts, 1);
});

test("P9.8 stale PROCESSING state is not silently recovered by current claim semantics", () => {
  const queue = new DispatcherHarness();
  queue.seed("evt-001");

  queue.claim(1);
  queue.advance(3600);

  // This intentionally documents the currently observed production behavior:
  // locked_at exists, but claim_outbox_events does not use lease_seconds to
  // reclaim stale PROCESSING rows.
  assert.deepEqual(queue.claim(1), []);
  assert.equal(queue.snapshot("evt-001").status, "PROCESSING");
  assert.equal(queue.snapshot("evt-001").locked_at, 0);
  assert.equal(queue.snapshot("evt-001").attempts, 1);
});

test("P9.8 retry after release creates a new claim without changing event identity", () => {
  const queue = new DispatcherHarness();
  queue.seed("evt-001");

  const [first] = queue.claim(1);
  queue.release("evt-001", "SYNTHETIC_FAILURE", 30);
  queue.advance(30);
  const [retry] = queue.claim(1);

  assert.equal(retry.event_id, first.event_id);
  assert.equal(retry.attempts, 2);
  assert.equal(retry.status, "PROCESSING");
});

test("P9.8 completion cannot bypass PROCESSING state", () => {
  const queue = new DispatcherHarness();
  queue.seed("evt-001");

  assert.throws(() => queue.complete("evt-001"), /PROCESSING/);
  assert.equal(queue.snapshot("evt-001").status, "PENDING");
});

test("P9.8 release cannot bypass PROCESSING state", () => {
  const queue = new DispatcherHarness();
  queue.seed("evt-001");

  assert.throws(
    () => queue.release("evt-001", "INVALID_RELEASE", 30),
    /PROCESSING/,
  );
  assert.equal(queue.snapshot("evt-001").status, "PENDING");
});
