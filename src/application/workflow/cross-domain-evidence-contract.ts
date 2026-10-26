export const CROSS_DOMAIN_EVIDENCE_CONTRACT_VERSION = "P10.27-v1";

export type EvidenceKind =
  | "LEAVE"
  | "DOCUMENT"
  | "ESCORT"
  | "MOVEMENT"
  | "RETURN";

export interface CrossDomainEvidence {
  evidenceId: string;
  requestId: string;
  correlationId: string;
  subjectId: string;
  sourceId: string;
  kind: EvidenceKind;
  occurredAt: string;
  verified: boolean;
}

export interface EvidenceChain {
  requestId: string;
  correlationId: string;
  entries: CrossDomainEvidence[];
}

export function validateEvidenceChain(chain: EvidenceChain): boolean {
  if (!chain.requestId || !chain.correlationId || chain.entries.length === 0) return false;
  return chain.entries.every((entry) =>
    entry.requestId === chain.requestId &&
    entry.correlationId === chain.correlationId &&
    Boolean(entry.evidenceId) &&
    Boolean(entry.subjectId) &&
    Boolean(entry.sourceId) &&
    Boolean(entry.occurredAt) &&
    entry.verified === true
  );
}

export function hasRequiredTemporaryExitEvidence(chain: EvidenceChain): boolean {
  if (!validateEvidenceChain(chain)) return false;
  const kinds = new Set(chain.entries.map((entry) => entry.kind));
  return ["LEAVE","DOCUMENT","ESCORT","MOVEMENT","RETURN"].every((kind) => kinds.has(kind as EvidenceKind));
}
