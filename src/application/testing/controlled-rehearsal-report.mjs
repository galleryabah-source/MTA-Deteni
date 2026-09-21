import { createHash } from "node:crypto";

export const CONTROLLED_REHEARSAL_REPORT_VERSION = "P10.253-260-v1";

const sha256 = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function buildControlledRehearsalReport(input) {
  if (input.certificationStatus !== "REHEARSAL_CERTIFIED") {
    throw new Error("REHEARSAL_CERTIFICATION_REQUIRED");
  }
  if (input.productionCertified !== false) {
    throw new Error("PRODUCTION_CERTIFICATION_MUST_REMAIN_FALSE");
  }
  if (input.executionAuthorized !== false) {
    throw new Error("EXECUTION_AUTHORIZATION_MUST_REMAIN_FALSE");
  }

  const report = {
    version: CONTROLLED_REHEARSAL_REPORT_VERSION,
    scenarioId: input.scenarioId,
    certificationStatus: input.certificationStatus,
    matrixStatus: input.matrixStatus,
    evidenceFingerprint: input.evidenceFingerprint,
    controls: {
      syntheticOnly: true,
      migrationFreeze: true,
      aiEnabled: false,
      productionMutation: false,
      externalTransport: false,
      productionCertified: false,
      executionAuthorized: false,
    },
  };

  return {
    ...report,
    reportFingerprint: sha256(report),
  };
}
