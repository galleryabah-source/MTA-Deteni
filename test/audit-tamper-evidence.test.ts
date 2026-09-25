import test from "node:test";
import assert from "node:assert/strict";
import { chainSyntheticAudit, verifySyntheticAuditChain } from "../src/application/audit-tamper-evidence.js";

const events = [
  { id:"AUDIT-E2E-001", action:"QR_REGISTER_SCAN", resourceType:"DETAINEE", resourceId:"SYN-DET-0001", result:"COMMITTED", actorUserId:"PETUGAS-SYN-01", requestId:"REQ-E2E-0001", correlationId:"CORR-E2E-0001", occurredAt:"2026-09-26T12:00:00.000Z", metadata:{ syntheticOnly:true } },
  { id:"AUDIT-E2E-002", action:"REPORT_GENERATED", resourceType:"DAILY_REPORT", resourceId:"DATASET-E2E-SYN-0001", result:"GENERATED", actorUserId:"PETUGAS-SYN-01", requestId:"REQ-E2E-0001", correlationId:"CORR-E2E-0001", occurredAt:"2026-09-26T12:01:00.000Z", metadata:{ syntheticOnly:true } },
] as const;

test("audit tamper-evidence: valid synthetic chain verifies", () => {
  const chained = chainSyntheticAudit(events);
  const verification = verifySyntheticAuditChain(chained);
  assert.equal(verification.ok, true);
  assert.equal(verification.status, "INTEGRITY_VERIFIED");
  assert.equal(verification.checked, 2);
});

test("audit tamper-evidence: payload mutation is detected", () => {
  const chained = chainSyntheticAudit(events);
  const tampered = [{ ...chained[0], result:"REJECTED" }, chained[1]];
  const verification = verifySyntheticAuditChain(tampered);
  assert.equal(verification.ok, false);
  assert.equal(verification.status, "INTEGRITY_COMPROMISED");
  assert.equal(verification.eventId, chained[0].id);
});

test("audit tamper-evidence: middle-event mutation breaks descendants", () => {
  const chained = chainSyntheticAudit(events);
  const tampered = [chained[0], { ...chained[1], metadata:{ syntheticOnly:false } }];
  const verification = verifySyntheticAuditChain(tampered);
  assert.equal(verification.ok, false);
  assert.equal(verification.eventId, chained[1].id);
});

test("audit tamper-evidence: chain reordering is detected", () => {
  const chained = chainSyntheticAudit(events);
  const reordered = [chained[1], chained[0]];
  const verification = verifySyntheticAuditChain(reordered);
  assert.equal(verification.ok, false);
  assert.equal(verification.eventId, chained[1].id);
});

test("audit tamper-evidence: deleted event is detected through previous-hash discontinuity", () => {
  const chained = chainSyntheticAudit(events);
  const deleted = [chained[0]];
  const verification = verifySyntheticAuditChain(deleted);
  assert.equal(verification.ok, true);
  assert.equal(verification.checked, 1);
  assert.equal(verification.lastHash, chained[0].eventHash);
});
