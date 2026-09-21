import { createHash } from "node:crypto";

export const PRODUCTION_READINESS_EVIDENCE_VERSION = "P10.285-292-v1";

const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function buildProductionReadinessEvidence({
  kernelCertification,
  rehearsalCertification,
  databaseEvidence,
  reconciliation,
}) {
  if (kernelCertification !== "CERTIFIED") throw new Error("KERNEL_CERTIFICATION_REQUIRED");
  if (rehearsalCertification !== "REHEARSAL_CERTIFIED") throw new Error("REHEARSAL_CERTIFICATION_REQUIRED");
  if (databaseEvidence?.status !== "POSTGRES_BEHAVIOR_PASS") throw new Error("DATABASE_BEHAVIOR_PASS_REQUIRED");
  if (reconciliation?.status !== "DB_EVIDENCE_RECONCILED") throw new Error("DB_EVIDENCE_RECONCILIATION_REQUIRED");

  const evidence = {
    version: PRODUCTION_READINESS_EVIDENCE_VERSION,
    kernelCertification,
    rehearsalCertification,
    databaseBehavior: databaseEvidence.status,
    reconciliation: reconciliation.status,
    controls: {
      productionMutation: false,
      externalTransport: false,
      executionAuthorized: false,
      productionCertified: false,
    },
  };

  return {
    status: "READINESS_EVIDENCE_COMPLETE",
    ...evidence,
    evidenceFingerprint: hash(evidence),
  };
}
