import assert from "node:assert/strict";
import test from "node:test";
import { toOperationalEvidence } from "../src/application/p12-681-720-operational-evidence-ledger.js";
import { recoveryDecision } from "../src/application/p12-721-760-projection-recovery-matrix.js";
import { buildApiAuditEnvelope } from "../src/application/p12-761-800-api-audit-envelope.js";
import { assertCrossDomainConsistency } from "../src/application/p12-801-840-cross-domain-consistency.js";

const actor = { actorId: "ACT-SYN", role: "OPERATOR", domain: "KAMTIB" as const, scope: {}, correlationId: "CORR-SYN", idempotencyKey: "IDEMP-SYN" };
const audit = { eventId: "EV-SYN", eventType: "DetaineeUpdated", aggregateType: "DETAINEE", aggregateId: "DET-SYN", actorId: "ACT-SYN", correlationId: "CORR-SYN", occurredAt: "2026-09-15T00:00:00Z", payloadHash: "HASH-SYN" };

test("P12.681-720 converts audit evidence without losing identity", () => assert.equal(toOperationalEvidence(audit).aggregateId, "DET-SYN"));
test("P12.721-760 maps failures to deterministic recovery actions", () => {
  assert.equal(recoveryDecision("TRANSIENT").action, "RETRY");
  assert.equal(recoveryDecision("IDENTITY_DRIFT").action, "HALT");
});
test("P12.761-800 requires audit evidence for accepted API commands", () => {
  const envelope = buildApiAuditEnvelope({ requestId: "REQ-SYN", commandId: "CMD-SYN", actor, outcome: "ACCEPTED", auditEvent: audit });
  assert.equal(envelope.correlationId, "CORR-SYN");
});
test("P12.801-840 blocks mixed detainee or correlation identity", () => {
  const identity = { detaineeId: "DET-SYN", aggregateId: "DET-SYN", correlationId: "CORR-SYN", actorId: "ACT-SYN" };
  assert.equal(assertCrossDomainConsistency([{ domain: "RAP", identity }, { domain: "KAMTIB", identity }]), "CONSISTENT");
  assert.equal(assertCrossDomainConsistency([{ domain: "RAP", identity }, { domain: "KAMTIB", identity: { ...identity, detaineeId: "DET-OTHER" } }]), "BLOCKED");
});
