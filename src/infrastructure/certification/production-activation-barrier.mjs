export const PRODUCTION_ACTIVATION_BARRIER_VERSION = "P10.301-308-v1";

const TRUE_GATES = [
  "runtimeReadinessComplete",
  "operatorApproval",
  "changeWindowOpen",
  "rollbackPlanVerified",
  "observabilityReady",
  "backupVerified",
  "securityGatePassed",
  "artifactIntegrityPassed",
];

export function evaluateProductionActivation(input) {
  for (const key of TRUE_GATES) {
    if (input?.[key] !== true) {
      return {
        status: "ACTIVATION_BLOCKED",
        reason: `ACTIVATION_GATE_REQUIRED:${key}`,
        executionAuthorized: false,
        productionCertified: false,
      };
    }
  }

  return {
    status: "ACTIVATION_READY_FOR_SEPARATE_GOVERNED_DECISION",
    executionAuthorized: false,
    productionCertified: false,
  };
}
