export const GOVERNED_REHEARSAL_GATE_VERSION = "P10.221-228-v1";

export function evaluateGovernedRehearsalGate(input) {
  const required = [
    ["dryRunReady", "DRY_RUN_NOT_READY"],
    ["manifestVerified", "SCENARIO_MANIFEST_INVALID"],
    ["evidenceVerified", "SCENARIO_EVIDENCE_INVALID"],
    ["identityConsistent", "IDENTITY_CONSISTENCY_FAILED"],
    ["syntheticOnly", "NON_SYNTHETIC"],
    ["migrationFreeze", "MIGRATION_FREEZE_REQUIRED"],
    ["aiDisabled", "AI_MUST_REMAIN_OFF"],
  ];

  for (const [field, reason] of required) {
    if (input[field] !== true) {
      return blocked(reason);
    }
  }

  return {
    status: "READY_FOR_GOVERNED_REHEARSAL",
    executionAuthorized: false,
    productionMutationAllowed: false,
    externalTransportAllowed: false,
    version: GOVERNED_REHEARSAL_GATE_VERSION,
  };
}

function blocked(reason) {
  return {
    status: "BLOCKED",
    executionAuthorized: false,
    productionMutationAllowed: false,
    externalTransportAllowed: false,
    reason,
    version: GOVERNED_REHEARSAL_GATE_VERSION,
  };
}
