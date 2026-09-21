import { createHash } from "node:crypto";

export const RELEASE_CANDIDATE_GATE_VERSION = "P10.325-332-v1";

const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function evaluateReleaseCandidate(input) {
  const required = [
    "activationEvidenceComplete",
    "changeControlComplete",
    "artifactFingerprintValid",
    "rollbackReferenceValid",
    "securityEvidenceValid",
    "observabilityEvidenceValid",
    "backupEvidenceValid",
    "productionTargetExplicit",
  ];

  for (const key of required) {
    if (input?.[key] !== true) {
      return {
        status: "RELEASE_CANDIDATE_BLOCKED",
        reason: `RELEASE_GATE_REQUIRED:${key}`,
        executionAuthorized: false,
        productionCertified: false,
      };
    }
  }

  const candidate = {
    version: RELEASE_CANDIDATE_GATE_VERSION,
    status: "RELEASE_CANDIDATE_READY_FOR_GOVERNED_REVIEW",
    controls: {
      executionAuthorized: false,
      productionCertified: false,
      productionMutation: false,
      externalTransport: false,
    },
  };

  return { ...candidate, candidateFingerprint: hash(candidate) };
}
