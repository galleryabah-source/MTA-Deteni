export const INTEGRATED_PERSISTENCE_CERTIFICATION_VERSION = "P9.21-v1";

export type EvidenceStatus = "PASS" | "FAIL" | "MISSING" | "UNVERIFIED";

export interface PersistenceEvidence {
  adapter: EvidenceStatus;
  transaction: EvidenceStatus;
  repository: EvidenceStatus;
  auditRepository: EvidenceStatus;
  outboxRepository: EvidenceStatus;
  reconciliation: EvidenceStatus;
  migrationFreeze: boolean;
  productionMutation: boolean;
}

export function certifyIntegratedPersistence(evidence: PersistenceEvidence): "CERTIFIED" | "NOT_CERTIFIED" {
  if (evidence.migrationFreeze !== true) return "NOT_CERTIFIED";
  if (evidence.productionMutation !== false) return "NOT_CERTIFIED";
  const required: EvidenceStatus[] = [
    evidence.adapter,
    evidence.transaction,
    evidence.repository,
    evidence.auditRepository,
    evidence.outboxRepository,
    evidence.reconciliation,
  ];
  return required.every((status) => status === "PASS") ? "CERTIFIED" : "NOT_CERTIFIED";
}
