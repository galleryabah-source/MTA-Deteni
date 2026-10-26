import test from "node:test";
import assert from "node:assert/strict";
import { createCanonicalIdentityChain, assertCanonicalIdentityContinuity, assertCanonicalOutboxReplayIdentity } from "../src/application/canonical-identity-contract.ts";

const execution = {
  requestId: "req-p99-001",
  correlationId: "corr-p99-001",
  transactionId: "tx-p99-001",
  idempotencyKey: "idem-p99-001",
};

const audit = {
  eventId: "audit-p99-001",
  eventType: "DETAINEE_UPDATED",
  aggregateType: "DETAINEE",
  aggregateId: "DET-SYN-001",
  actorId: "actor-synthetic",
  correlationId: execution.correlationId,
  occurredAt: "2026-09-30T00:00:00.000Z",
  payloadHash: "hash-p99-001",
};

const outbox = {
  eventId: "event-p99-001",
  aggregateType: "DETAINEE",
  aggregateId: "DET-SYN-001",
  idempotencyKey: execution.idempotencyKey,
};

const makeChain = () => createCanonicalIdentityChain({
  execution,
  commandId: "cmd-p99-001",
  aggregateType: "DETAINEE",
  aggregateId: "DET-SYN-001",
  audit,
  outbox,
  payloadFingerprint: "fp-p99-001",
  deliveryIdentity: "delivery-p99-001",
  projectionIdentity: "projection-p99-001",
});

test("P9.9 creates one canonical identity chain across command, audit and outbox", () => {
  const chain = makeChain();
  assert.equal(chain.commandId, "cmd-p99-001");
  assert.equal(chain.auditEventId, audit.eventId);
  assert.equal(chain.eventId, outbox.eventId);
  assert.equal(chain.correlationId, execution.correlationId);
  assert.equal(chain.idempotencyKey, execution.idempotencyKey);
  assert.equal(chain.aggregateId, "DET-SYN-001");
});

test("P9.9 rejects audit aggregate drift", () => {
  assert.throws(() => createCanonicalIdentityChain({
    execution,
    commandId: "cmd-p99-001",
    aggregateType: "DETAINEE",
    aggregateId: "DET-SYN-001",
    audit: { ...audit, aggregateId: "DET-SYN-999" },
    outbox,
    payloadFingerprint: "fp-p99-001",
  }), /CANONICAL_AUDIT_AGGREGATE_ID_MISMATCH/);
});

test("P9.9 rejects outbox idempotency drift", () => {
  assert.throws(() => createCanonicalIdentityChain({
    execution,
    commandId: "cmd-p99-001",
    aggregateType: "DETAINEE",
    aggregateId: "DET-SYN-001",
    audit,
    outbox: { ...outbox, idempotencyKey: "idem-drift" },
    payloadFingerprint: "fp-p99-001",
  }), /CANONICAL_IDEMPOTENCY_KEY_MISMATCH/);
});

test("P9.9 rejects observed identity drift at any downstream seam", () => {
  const chain = makeChain();
  assert.doesNotThrow(() => assertCanonicalIdentityContinuity(chain, {
    eventId: chain.eventId,
    deliveryIdentity: chain.deliveryIdentity,
    projectionIdentity: chain.projectionIdentity,
  }));
  assert.throws(() => assertCanonicalIdentityContinuity(chain, {
    correlationId: "corr-drift",
  }), /CANONICAL_IDENTITY_MISMATCH:correlationId/);
});

test("P9.9 replay requires exact event, idempotency, aggregate and fingerprint identity", () => {
  const chain = makeChain();
  assert.doesNotThrow(() => assertCanonicalOutboxReplayIdentity(chain, chain));
  assert.throws(() => assertCanonicalOutboxReplayIdentity(chain, { ...chain, eventId: "event-drift" }), /CANONICAL_EVENT_ID_DRIFT/);
  assert.throws(() => assertCanonicalOutboxReplayIdentity(chain, { ...chain, payloadFingerprint: "fp-drift" }), /CANONICAL_PAYLOAD_FINGERPRINT_DRIFT/);
});

test("P9.9 synthetic identity chain remains immutable", () => {
  const chain = makeChain();
  assert.equal(Object.isFrozen(chain), true);
});
