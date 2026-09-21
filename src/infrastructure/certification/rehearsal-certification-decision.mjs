export const REHEARSAL_CERTIFICATION_VERSION = "P10.245-252-v1";

export function decideRehearsalCertification(input) {
  const checks = [
    ["matrixPass", "MATRIX_NOT_PASS"],
    ["evidenceIntegrityPass", "EVIDENCE_INTEGRITY_FAILED"],
    ["scenarioEvidencePass", "SCENARIO_EVIDENCE_FAILED"],
    ["dryRunReadinessPass", "DRY_RUN_READINESS_FAILED"],
    ["governedGatePass", "GOVERNED_GATE_FAILED"],
    ["syntheticOnly", "NON_SYNTHETIC"],
    ["migrationFreeze", "MIGRATION_FREEZE_REQUIRED"],
    ["aiDisabled", "AI_MUST_REMAIN_OFF"],
    ["productionMutationFalse", "PRODUCTION_MUTATION_DETECTED"],
    ["externalTransportFalse", "EXTERNAL_TRANSPORT_DETECTED"],
  ];

  for (const [field, reason] of checks) {
    if (input[field] !== true) {
      return {
        status: "NOT_CERTIFIED",
        reason,
        version: REHEARSAL_CERTIFICATION_VERSION,
      };
    }
  }

  return {
    status: "REHEARSAL_CERTIFIED",
    reason: "ALL_CONTROLLED_NONPROD_EVIDENCE_PASS",
    version: REHEARSAL_CERTIFICATION_VERSION,
    productionCertified: false,
    executionAuthorized: false,
  };
}
