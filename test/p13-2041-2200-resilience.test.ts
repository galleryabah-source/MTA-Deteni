import test from "node:test";
import assert from "node:assert/strict";
import { decideOperatorRecovery } from "../src/application/p13-2041-2080-error-recovery.js";
import { evaluateLocalFirstSync } from "../src/application/p13-2081-2120-local-first-sync.js";
import { composeCorrelatedAuditChain } from "../src/application/p13-2121-2160-audit-correlation.js";
import { evaluateOfflineSafety } from "../src/application/p13-1881-1920-offline-degraded-safety.js";
import { composeSyntheticReleaseTrace } from "../src/application/p13-2001-2040-synthetic-release-trace.js";
import { acceptSyntheticResilience } from "../src/application/p13-2161-2200-resilience-acceptance.js";

test("P13.2041-2200: resilience remains safe and evidence preserving", () => {
  assert.equal(decideOperatorRecovery("NETWORK_UNAVAILABLE", true).action, "SAVE_DRAFT");
  assert.equal(evaluateLocalFirstSync({ recordId: "r1", sourceEvidenceId: "e1", syncState: "CONFLICT", localVersion: 2 }).syncState, "BLOCKED");
  const event = { eventId: "a1", eventType: "TEST", aggregateType: "DETAINEE", aggregateId: "d1", actorId: "op1", correlationId: "c1", occurredAt: "2026-09-15T10:00:00Z", payloadHash: "h1" };
  assert.deepEqual(composeCorrelatedAuditChain("c1", [event]).eventIds, ["a1"]);
  const acceptance = acceptSyntheticResilience(evaluateOfflineSafety("OFFLINE"), composeSyntheticReleaseTrace("t1"));
  assert.equal(acceptance.accepted, true);
  assert.equal(acceptance.syntheticOnly, true);
});
