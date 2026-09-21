import { createHash } from "node:crypto";

export const DRY_RUN_READINESS_VERSION = "P10.197-204-v1";

const REQUIRED_IDENTITIES = [
  "decisionId",
  "preflightId",
  "packetId",
  "policyVersion",
];

const sha256 = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

function requireNonEmpty(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`DRY_RUN_IDENTITY_INVALID:${field}`);
  }
}

export function composeDryRunReadiness(input) {
  for (const field of REQUIRED_IDENTITIES) requireNonEmpty(input[field], field);

  if (input.syntheticOnly !== true) {
    return blocked("NON_SYNTHETIC");
  }

  if (input.migrationFreeze !== true) {
    return blocked("MIGRATION_FREEZE_REQUIRED");
  }

  if (input.aiEnabled !== false) {
    return blocked("AI_MUST_REMAIN_OFF");
  }

  const identity = {
    decisionId: input.decisionId,
    preflightId: input.preflightId,
    packetId: input.packetId,
    policyVersion: input.policyVersion,
  };

  const expected = {
    decisionId: input.expectedDecisionId,
    preflightId: input.expectedPreflightId,
    packetId: input.expectedPacketId,
    policyVersion: input.expectedPolicyVersion,
  };

  for (const field of REQUIRED_IDENTITIES) {
    requireNonEmpty(expected[field], `expected.${field}`);
    if (identity[field] !== expected[field]) {
      return blocked(`IDENTITY_MISMATCH:${field}`, identity);
    }
  }

  if (!["APPROVED", "REJECTED", "PENDING", "BLOCKED"].includes(input.decisionStatus)) {
    return blocked("DECISION_STATUS_INVALID", identity);
  }

  if (input.decisionStatus !== "APPROVED") {
    return blocked(`DECISION_NOT_APPROVED:${input.decisionStatus}`, identity);
  }

  if (input.executionAuthorization !== false) {
    return blocked("EXECUTION_AUTHORIZATION_MUST_REMAIN_SEPARATE", identity);
  }

  const readinessMaterial = {
    version: DRY_RUN_READINESS_VERSION,
    identity,
    decisionStatus: input.decisionStatus,
    executionAuthorization: input.executionAuthorization,
    syntheticOnly: input.syntheticOnly,
    migrationFreeze: input.migrationFreeze,
    aiEnabled: input.aiEnabled,
  };

  return {
    status: "READY_FOR_GOVERNED_DRY_RUN",
    executionAuthorized: false,
    reason: "EVIDENCE_ONLY",
    readinessFingerprint: sha256(readinessMaterial),
    version: DRY_RUN_READINESS_VERSION,
    identity,
  };
}

function blocked(reason, identity = null) {
  return {
    status: "BLOCKED",
    executionAuthorized: false,
    reason,
    version: DRY_RUN_READINESS_VERSION,
    identity,
    readinessFingerprint: null,
  };
}
