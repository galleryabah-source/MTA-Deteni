import assert from "node:assert/strict";
import test from "node:test";
import { appendTimelineEvent, validateTimeline } from "../src/application/p11-817-872-operational-timeline.js";
import { sameCorrelation, validateAuditOutboxCorrelation } from "../src/application/p11-873-904-audit-outbox-correlation.js";
import { evaluateIdempotencyIdentity, resolveIdempotency } from "../src/application/p11-905-936-idempotency-contract.js";
import { denyByDefault, evaluateAuthorizationCase } from "../src/application/p11-937-960-authorization-regression.js";
import type { ActorContext, AuditEvent } from "../src/domain/shared/contracts.js";

const actor: ActorContext = { actorId: "ACT-SYN-001", role: "OPERATOR", domain: "KAMTIB", scope: {}, correlationId: "CORR-SYN-001" };
const audit: AuditEvent = { eventId: "AUD-SYN-001", eventType: "TEMPORARY_EXIT_DEPARTED", aggregateType: "TEMPORARY_EXIT", aggregateId: "EXIT-SYN-001", actorId: actor.actorId, correlationId: actor.correlationId, occurredAt: "2026-01-01T00:00:00.000Z", payloadHash: "hash-synthetic-001" };

test("P11.817-872 accepts immutable ordered timeline", () => {
  const timeline = appendTimelineEvent({ timelineId: "TL-001", aggregateId: audit.aggregateId, events: [] }, audit);
  assert.ok(timeline);
  assert.equal(validateTimeline(timeline), "READY");
  assert.equal(appendTimelineEvent(timeline, audit), null);
});

test("P11.873-904 binds audit and outbox to correlation and aggregate", () => {
  const a = { correlationId: "CORR-1", auditEventId: "AUD-1", outboxMessageId: "OUT-1", aggregateId: "AGG-1", topic: "temporary-exit" } as const;
  const b = { ...a, auditEventId: "AUD-2", outboxMessageId: "OUT-2" } as const;
  assert.equal(validateAuditOutboxCorrelation(a), "READY");
  assert.equal(sameCorrelation(a, b), true);
});

test("P11.905-936 enforces idempotent replay versus fingerprint conflict", () => {
  const identity = { idempotencyKey: "IDEMP-1", fingerprint: "FP-1", actorId: actor.actorId, correlationId: actor.correlationId } as const;
  assert.equal(evaluateIdempotencyIdentity(identity), "READY");
  assert.equal(resolveIdempotency(null, "FP-1"), "ACQUIRED");
  assert.equal(resolveIdempotency("FP-1", "FP-1"), "REPLAY");
  assert.equal(resolveIdempotency("FP-1", "FP-2"), "CONFLICT");
});

test("P11.937-960 uses domain ownership as a deny-by-default regression", () => {
  assert.equal(denyByDefault(actor, "KAMTIB"), true);
  assert.equal(denyByDefault(actor, "RAP"), false);
  assert.equal(evaluateAuthorizationCase({ checkpoint: "P11.937-944", actor, requiredDomain: "RAP", permission: "TEMPORARY_EXIT_APPROVE", allowed: false }), "PASS");
  assert.equal(evaluateAuthorizationCase({ checkpoint: "P11.945-952", actor, requiredDomain: "KAMTIB", permission: "TEMPORARY_EXIT_VALIDATE", allowed: false }), "BLOCKED");
});
