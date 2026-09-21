import assert from "node:assert/strict";
import test from "node:test";
import {
  TRANSACTION_IDEMPOTENCY_CONTRACT_VERSION,
  validateIdempotencyKey,
  validateRequestHash,
  validateIdempotencyReplay,
} from "../src/infrastructure/database/transaction-idempotency";

test("P9.7 exposes a versioned transaction/idempotency contract", () => {
  assert.equal(TRANSACTION_IDEMPOTENCY_CONTRACT_VERSION, "P9.7-v1");
});

test("idempotency key is mandatory", () => {
  assert.throws(() => validateIdempotencyKey(""), /IDEMPOTENCY_KEY_REQUIRED/);
});

test("request hash is mandatory", () => {
  assert.throws(() => validateRequestHash(""), /REQUEST_HASH_REQUIRED/);
});

test("same request hash is a deterministic replay", () => {
  assert.equal(
    validateIdempotencyReplay({ requestHash: "hash-a" }, "hash-a"),
    "REPLAY",
  );
});

test("different request hash is a deterministic conflict", () => {
  assert.equal(
    validateIdempotencyReplay({ requestHash: "hash-a" }, "hash-b"),
    "CONFLICT",
  );
});
