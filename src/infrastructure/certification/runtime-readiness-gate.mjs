import { createHash } from "node:crypto";

export const RUNTIME_READINESS_GATE_VERSION = "P10.293-300-v1";

const sha256 = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

const REQUIRED = [
  "kernelCertified",
  "rehearsalCertified",
  "databaseBehaviorPass",
  "evidenceReconciled",
];

export function evaluateRuntimeReadiness(input) {
  if (!input || typeof input !== "object") {
    throw new Error("RUNTIME_READINESS_INPUT_REQUIRED");
  }

  for (const key of REQUIRED) {
    if (input[key] !== true) throw new Error(`READINESS_PREREQUISITE_FAILED:${key}`);
  }

  if (input.productionMutation !== false) {
    throw new Error("PRODUCTION_MUTATION_MUST_REMAIN_FALSE");
  }
  if (input.externalTransport !== false) {
    throw new Error("EXTERNAL_TRANSPORT_MUST_REMAIN_FALSE");
  }
  if (input.executionAuthorized !== false) {
    throw new Error("EXECUTION_AUTHORIZATION_MUST_REMAIN_FALSE");
  }
  if (input.productionCertified !== false) {
    throw new Error("PRODUCTION_CERTIFICATION_MUST_REMAIN_FALSE");
  }

  const evidence = {
    version: RUNTIME_READINESS_GATE_VERSION,
    readiness: "RUNTIME_READINESS_COMPLETE",
    prerequisites: {
      kernelCertified: true,
      rehearsalCertified: true,
      databaseBehaviorPass: true,
      evidenceReconciled: true,
    },
    controls: {
      productionMutation: false,
      externalTransport: false,
      executionAuthorized: false,
      productionCertified: false,
    },
  };

  return {
    ...evidence,
    readinessFingerprint: sha256(evidence),
  };
}
