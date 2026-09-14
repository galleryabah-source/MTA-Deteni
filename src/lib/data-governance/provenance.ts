import type { DataProvenance } from "./types";

export const isValidConfidence = (confidence: number | undefined): boolean =>
  confidence === undefined || (Number.isFinite(confidence) && confidence >= 0 && confidence <= 1);

export const validateProvenance = (provenance: DataProvenance): string[] => {
  const errors: string[] = [];
  if (!provenance.source.trim()) errors.push("SOURCE_REQUIRED");
  if (!provenance.observedAt.trim()) errors.push("OBSERVED_AT_REQUIRED");
  if (!isValidConfidence(provenance.confidence)) errors.push("CONFIDENCE_OUT_OF_RANGE");
  return errors;
};

export const provenanceFingerprint = (provenance: DataProvenance): string =>
  JSON.stringify({
    source: provenance.source,
    sourceRef: provenance.sourceRef ?? null,
    actorUserId: provenance.actorUserId ?? null,
    observedAt: provenance.observedAt,
    ingestionMethod: provenance.ingestionMethod,
    confidence: provenance.confidence ?? null,
    verification: provenance.verification,
  });
