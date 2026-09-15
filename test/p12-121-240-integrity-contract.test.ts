import assert from "node:assert/strict";
import test from "node:test";
import type { ActorContext, AuditEvent } from "../src/domain/shared/contracts.js";
import { assertSameTransactionIdentity, buildTransactionContextMetadata, validateSharedTransactionContext } from "../src/application/p12-121-160-shared-transaction-context.js";
import { assertReplaySafe, validateIdempotencyRecord } from "../src/application/p12-161-200-persistent-idempotency-contract.js";
import { assertLeadershipReadOnlyOperational, authorizeByPolicy, isPermissionDeclared, policyMatrix } from "../src/application/p12-201-240-authorization-policy-matrix.js";

const actor: ActorContext = { actorId: "ACT-SYN-P12", role: "OPERATOR", domain: "KAMTIB", scope: {}, correlationId: "CORR-SYN-P12", idempotencyKey: "IDEMP-SYN-P12" };
const metadata = buildTransactionContextMetadata(actor, "EXIT-SYN-P12", "TX-SYN-P12");
const audit: AuditEvent = { eventId: "AUD-SYN-P12", eventType: "TEMPORARY_EXIT_VALIDATED", aggregateType: "TEMPORARY_EXIT", aggregateId: "EXIT-SYN-P12", actorId: actor.actorId, correlationId: actor.correlationId, occurredAt: "2026-01-01T00:00:00.000Z", payloadHash: "hash-synthetic-p12" };
const outbox = { messageId: "OUT-SYN-P12", topic: "temporary-exit.updated", aggregateId: "EXIT-SYN-P12", payload: {} } as const;

test("P12.121-160 creates one shared transaction identity", () => {
  assert.equal(validateSharedTransactionContext({ metadata, persistAudit: async () => {}, persistOutbox: async () => {}, completeIdempotency: async () => {} }), "READY");
  assert.doesNotThrow(() => assertSameTransactionIdentity(metadata, audit, outbox));
  assert.throws(() => assertSameTransactionIdentity({ ...metadata, aggregateId: "OTHER" }, audit, outbox), /TRANSACTION_AUDIT_AGGREGATE_MISMATCH/);
});

test("P12.161-200 requires completed persistent idempotency for replay", () => {
  const record = { key: "IDEMP-1", fingerprint: "FP-1", actorId: actor.actorId, correlationId: actor.correlationId, aggregateId: "EXIT-SYN-P12", state: "COMPLETED", result: { value: "OK" } } as const;
  assert.equal(validateIdempotencyRecord(record), "READY");
  assert.doesNotThrow(() => assertReplaySafe(record, "FP-1", actor.actorId, actor.correlationId, "EXIT-SYN-P12"));
  assert.throws(() => assertReplaySafe(record, "FP-2", actor.actorId, actor.correlationId, "EXIT-SYN-P12"), /IDEMPOTENCY_IDENTITY_CONFLICT/);
  assert.throws(() => assertReplaySafe({ ...record, state: "IN_PROGRESS", result: undefined }, "FP-1", actor.actorId, actor.correlationId, "EXIT-SYN-P12"), /IDEMPOTENCY_REPLAY_NOT_COMPLETED/);
});

test("P12.201-240 enforces domain ownership matrix", () => {
  assert.equal(authorizeByPolicy("KAMTIB", "TEMPORARY_EXIT_VALIDATE"), true);
  assert.equal(authorizeByPolicy("RAP", "TEMPORARY_EXIT_VALIDATE"), false);
  assert.equal(isPermissionDeclared("PERKES", "HEALTH_RECORD_MANAGE"), true);
  assert.equal(isPermissionDeclared("SUBBAG_TU", "HEALTH_RECORD_MANAGE"), false);
  assert.equal(policyMatrix().LEADERSHIP.includes("OVERSIGHT_READ"), true);
  assert.doesNotThrow(() => assertLeadershipReadOnlyOperational("LEADERSHIP", "OVERSIGHT_READ"));
  assert.throws(() => assertLeadershipReadOnlyOperational("LEADERSHIP", "TEMPORARY_EXIT_VALIDATE"), /LEADERSHIP_OPERATIONAL_EDIT_FORBIDDEN/);
});
