import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateGovernedRehearsalGate,
  GOVERNED_REHEARSAL_GATE_VERSION,
} from "../src/application/governance/governed-rehearsal-gate.mjs";

const base = {
  dryRunReady: true,
  manifestVerified: true,
  evidenceVerified: true,
  identityConsistent: true,
  syntheticOnly: true,
  migrationFreeze: true,
  aiDisabled: true,
};

test("P10.221 complete governed evidence can reach rehearsal readiness", () => {
  const result = evaluateGovernedRehearsalGate(base);
  assert.equal(result.status, "READY_FOR_GOVERNED_REHEARSAL");
  assert.equal(result.executionAuthorized, false);
});

test("P10.222 missing dry-run readiness blocks", () => {
  assert.equal(evaluateGovernedRehearsalGate({ ...base, dryRunReady: false }).reason, "DRY_RUN_NOT_READY");
});

test("P10.223 manifest verification is mandatory", () => {
  assert.equal(evaluateGovernedRehearsalGate({ ...base, manifestVerified: false }).reason, "SCENARIO_MANIFEST_INVALID");
});

test("P10.224 evidence verification is mandatory", () => {
  assert.equal(evaluateGovernedRehearsalGate({ ...base, evidenceVerified: false }).reason, "SCENARIO_EVIDENCE_INVALID");
});

test("P10.225 identity consistency is mandatory", () => {
  assert.equal(evaluateGovernedRehearsalGate({ ...base, identityConsistent: false }).reason, "IDENTITY_CONSISTENCY_FAILED");
});

test("P10.226 safety controls remain fail-closed", () => {
  assert.equal(evaluateGovernedRehearsalGate({ ...base, syntheticOnly: false }).reason, "NON_SYNTHETIC");
  assert.equal(evaluateGovernedRehearsalGate({ ...base, migrationFreeze: false }).reason, "MIGRATION_FREEZE_REQUIRED");
  assert.equal(evaluateGovernedRehearsalGate({ ...base, aiDisabled: false }).reason, "AI_MUST_REMAIN_OFF");
});

test("P10.227 rehearsal readiness never grants production mutation", () => {
  const result = evaluateGovernedRehearsalGate(base);
  assert.equal(result.productionMutationAllowed, false);
  assert.equal(result.externalTransportAllowed, false);
});

test("P10.228 gate version is deterministic", () => {
  assert.equal(evaluateGovernedRehearsalGate(base).version, GOVERNED_REHEARSAL_GATE_VERSION);
});
