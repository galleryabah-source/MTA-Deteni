export const DATA_CLASSIFICATIONS = ["PUBLIC", "INTERNAL", "RESTRICTED", "HIGHLY_RESTRICTED"] as const;
export type DataClassification = (typeof DATA_CLASSIFICATIONS)[number];

export const VERIFICATION_STATES = [
  "DRAFT",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "SUPERSEDED",
] as const;
export type VerificationState = (typeof VERIFICATION_STATES)[number];

export const LIFECYCLE_STATES = [
  "ACTIVE",
  "ARCHIVED",
  "RETENTION_HOLD",
  "RETAINED",
  "ELIGIBLE_FOR_PURGE",
] as const;
export type LifecycleState = (typeof LIFECYCLE_STATES)[number];

export const PROVENANCE_METHODS = [
  "MANUAL_ENTRY",
  "DOCUMENT_IMPORT",
  "SYSTEM_GENERATED",
  "INTEGRATION",
  "RULE_ENGINE",
  "AI_ASSISTED",
] as const;
export type ProvenanceMethod = (typeof PROVENANCE_METHODS)[number];

export interface DataProvenance {
  readonly source: string;
  readonly sourceRef?: string;
  readonly actorUserId?: string;
  readonly observedAt: string;
  readonly ingestionMethod: ProvenanceMethod;
  readonly confidence?: number;
  readonly verification: VerificationState;
}

export interface DataGovernancePolicy {
  readonly classification: DataClassification;
  readonly allowedPurposes: readonly string[];
  readonly retentionDays?: number;
  readonly restricted: boolean;
  readonly externalAiAllowed: boolean;
}

export interface GovernedField<T = unknown> {
  readonly value: T;
  readonly classification: DataClassification;
  readonly provenance: DataProvenance;
  readonly lifecycle: LifecycleState;
  readonly version: number;
  readonly policy: DataGovernancePolicy;
}

export interface DataVersion<T = unknown> {
  readonly version: number;
  readonly value: T;
  readonly changedAt: string;
  readonly changedBy?: string;
  readonly reason: string;
  readonly previousVersion?: number;
}
