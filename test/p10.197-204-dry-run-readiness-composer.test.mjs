import test from "node:test";
import assert from "node:assert/strict";
import { composeDryRunReadiness, DRY_RUN_READINESS_VERSION } from "../src/application/governance/dry-run-readiness-composer.mjs";

const base = {
  decisionId: "decision-001",
  preflightId: "preflight-001",
  packetId: "packet-001",
  policyVersion: "POLICY-1",
  expectedDecisionId: "decision-001",
  expectedPreflightId: "preflight-001",
  expectedPacketId: "packet-001",
  expectedPolicyVersion: "POLICY-1",
  decisionStatus: "APPROVED",
  executionAuthorization: false,
  syntheticOnly: true,
  migrationFreeze: true,
  aiEnabled: false,
};

test("P10.197 identity validation blocks incomplete evidence", () => {
  assert.throws(() => composeDryRunReadiness({ ...base, decisionId: "" }), /DRY_RUN_IDENTITY_INVALID/);
});

test("P10.198 cross-artifact identity mismatch blocks readiness", () => {
  const result = composeDryRunReadiness({ ...base, expectedPacketId: "packet-other" });
  assert.equal(result.status, "BLOCKED");
  assert.equal(result.reason, "IDENTITY_MISMATCH:packetId");
});

test("P10.199 safety invariants remain fail-closed", () => {
  assert.equal(composeDryRunReadiness({ ...base, syntheticOnly: false }).reason, "NON_SYNTHETIC");
  assert.equal(composeDryRunReadiness({ ...base, migrationFreeze: false }).reason, "MIGRATION_FREEZE_REQUIRED");
  assert.equal(composeDryRunReadiness({ ...base, aiEnabled: true }).reason, "AI_MUST_REMAIN_OFF");
});

test("P10.200 only explicit APPROVED evidence may form dry-run readiness", () => {
  assert.equal(composeDryRunReadiness({ ...base, decisionStatus: "PENDING" }).reason, "DECISION_NOT_APPROVED:PENDING");
  assert.equal(composeDryRunReadiness({ ...base, decisionStatus: "REJECTED" }).reason, "DECISION_NOT_APPROVED:REJECTED");
});

test("P10.201 execution authorization is never implied by APPROVED evidence", () => {
  const result = composeDryRunReadiness(base);
  assert.equal(result.status, "READY_FOR_GOVERNED_DRY_RUN");
  assert.equal(result.executionAuthorized, false);
});

test("P10.202 readiness fingerprint is deterministic", () => {
  const a = composeDryRunReadiness(base);
  const b = composeDryRunReadiness(base);
  assert.equal(a.readinessFingerprint, b.readinessFingerprint);
  assert.equal(a.version, DRY_RUN_READINESS_VERSION);
});

test("P10.203 tampered policy identity cannot become ready", () => {
  const result = composeDryRunReadiness({ ...base, policyVersion: "POLICY-2" });
  assert.equal(result.status, "BLOCKED");
  assert.equal(result.reason, "IDENTITY_MISMATCH:policyVersion");
});

test("P10.204 readiness is evidence-only and never opens database execution", () => {
  let dbCalls = 0;
  const result = composeDryRunReadiness(base);
  dbCalls += Number(result.executionAuthorized);
  assert.equal(dbCalls, 0);
  assert.equal(result.reason, "EVIDENCE_ONLY");
});
