export const PRODUCTION_SCHEMA_EVIDENCE_VERSION = "P9.32-v1";

export type SchemaEvidenceStatus = "MATCH" | "MISMATCH" | "MISSING" | "UNEXPECTED" | "UNVERIFIED";

export interface SchemaObjectEvidence {
  objectName: string;
  expectedFingerprint: string;
  actualFingerprint: string;
  status: SchemaEvidenceStatus;
}

export interface ProductionSchemaEvidence {
  capturedAt: string;
  projectId: string;
  migrationFreeze: boolean;
  syntheticOnly: boolean;
  objects: SchemaObjectEvidence[];
}

export function certifyProductionSchemaEvidence(
  evidence: ProductionSchemaEvidence,
): "PASS" | "BLOCKED" {
  if (!evidence.migrationFreeze || !evidence.syntheticOnly) return "BLOCKED";
  if (!evidence.projectId || !evidence.capturedAt || evidence.objects.length === 0) return "BLOCKED";
  return evidence.objects.every(
    (item) =>
      item.status === "MATCH" &&
      item.expectedFingerprint === item.actualFingerprint,
  )
    ? "PASS"
    : "BLOCKED";
}
