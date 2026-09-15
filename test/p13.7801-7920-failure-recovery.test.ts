import test from "node:test";
import assert from "node:assert/strict";
import { assertCompensationBoundary, assertFailureRecoveryCase, createFailureRecoveryCase, failureRecoveryFingerprint, type FailureClass } from "../src/application/failure-recovery-contract.js";

const classes: readonly FailureClass[] = ["AUTHORIZATION_DENIED", "STALE_VERSION", "IDEMPOTENCY_CONFLICT", "REPOSITORY_CONFLICT", "OUTBOX_FAILURE", "PROJECTION_REFRESH_FAILURE", "OFFLINE_RECONNECT_CONFLICT"];

test("failure recovery matrix covers every governed failure class", () => {
  for (const failureClass of classes) {
    const item = createFailureRecoveryCase(failureClass);
    assertFailureRecoveryCase(item);
    assert.equal(item.syntheticOnly, true);
    assert.ok(failureRecoveryFingerprint(item).includes(failureClass));
  }
});

test("pre-commit failures fail closed and cannot be retried blindly", () => {
  for (const failureClass of ["AUTHORIZATION_DENIED", "STALE_VERSION", "IDEMPOTENCY_CONFLICT", "REPOSITORY_CONFLICT", "OFFLINE_RECONNECT_CONFLICT"] as const) {
    const item = createFailureRecoveryCase(failureClass);
    assert.equal(item.mutationCommitted, false);
    assert.equal(item.retrySafe, false);
    assert.equal(item.compensationAllowed, false);
    assertCompensationBoundary(item);
  }
});

test("post-commit infrastructure failures are retryable, not fake distributed rollbacks", () => {
  for (const failureClass of ["OUTBOX_FAILURE", "PROJECTION_REFRESH_FAILURE"] as const) {
    const item = createFailureRecoveryCase(failureClass);
    assert.equal(item.mutationCommitted, true);
    assert.equal(item.retrySafe, true);
    assert.equal(item.compensationAllowed, false);
    assert.equal(item.recovery, "RETRYABLE");
    assertCompensationBoundary(item);
  }
});

test("matrix rejects tampered recovery semantics", () => {
  const base = createFailureRecoveryCase("OUTBOX_FAILURE");
  assert.throws(() => assertFailureRecoveryCase({ ...base, retrySafe: false }));
  assert.throws(() => assertFailureRecoveryCase({ ...base, terminalState: "REJECTED" }));
});

test("compensation is an explicit boundary rather than implicit distributed rollback", () => {
  const base = createFailureRecoveryCase("REPOSITORY_CONFLICT");
  const compensation = { ...base, terminalState: "COMPENSATION_PENDING" as const, recovery: "COMPENSATION_REQUIRED" as const, mutationCommitted: true, compensationAllowed: true, retrySafe: false };
  assertFailureRecoveryCase(compensation);
  assertCompensationBoundary(compensation);
});
