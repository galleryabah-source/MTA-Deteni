import { createHash } from "node:crypto";

export const REHEARSAL_EVIDENCE_INTEGRITY_VERSION = "P10.245-252-v1";

const sha256 = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function buildRehearsalEvidenceRecord(input) {
  if (input.syntheticOnly !== true) throw new Error("EVIDENCE_MUST_BE_SYNTHETIC");
  if (input.productionMutation !== false) throw new Error("PRODUCTION_MUTATION_MUST_BE_FALSE");
  if (input.externalTransport !== false) throw new Error("EXTERNAL_TRANSPORT_MUST_BE_FALSE");
  if (typeof input.matrixFingerprint !== "string" || input.matrixFingerprint.length !== 64) {
    throw new Error("MATRIX_FINGERPRINT_INVALID");
  }

  const material = {
    version: REHEARSAL_EVIDENCE_INTEGRITY_VERSION,
    scenarioId: input.scenarioId,
    matrixFingerprint: input.matrixFingerprint,
    classification: input.classification,
    syntheticOnly: input.syntheticOnly,
    productionMutation: input.productionMutation,
    externalTransport: input.externalTransport,
  };

  return {
    ...material,
    evidenceFingerprint: sha256(material),
  };
}

export function verifyRehearsalEvidenceRecord(record) {
  try {
    return buildRehearsalEvidenceRecord(record).evidenceFingerprint === record.evidenceFingerprint;
  } catch {
    return false;
  }
}
