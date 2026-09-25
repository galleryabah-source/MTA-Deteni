export type FieldSource = 'EVIDENCE' | 'HUMAN' | 'SYSTEM' | 'AI_PROPOSAL';
export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
export type DatasetStatus = 'DRAFT' | 'VALIDATED' | 'READY_FOR_REVIEW' | 'APPROVED' | 'REJECTED';

export type EventType =
  | 'PEMERIKSAAN' | 'PENGAWALAN' | 'PERGERAKAN' | 'APEL_HEADCOUNT'
  | 'KUNJUNGAN' | 'KEAMANAN' | 'PELAYANAN' | 'KEJADIAN' | 'LAINNYA';

export interface FieldEvidence {
  evidenceId: string;
  eventType: EventType;
  capturedAt: string;
  actorId: string;
  location?: string;
  rawNote?: string;
  photoRefs?: string[];
  sourceKind: 'PHOTO' | 'NOTE' | 'VOICE' | 'DATA';
  includeInReport?: boolean;
  eventRef?: string;
  sequence?: number;
  syntheticOnly: true;
}

export interface DailyReportEvent {
  eventId: string;
  evidenceRefs: string[];
  eventType: EventType;
  occurredAt: string;
  actorId: string;
  location?: string;
  note?: string;
  verification: VerificationStatus;
}

export interface DailyReportPhoto {
  evidenceId: string;
  imageSlot: string;
  sequence: number;
  caption: string;
  verification: VerificationStatus;
}

export interface CanonicalDailyDataset {
  datasetId: string;
  reportDate: string;
  shiftId: string;
  groupId: string;
  events: DailyReportEvent[];
  photos: DailyReportPhoto[];
  counts: Record<string, number>;
  narrative: string[];
  sourceEvidenceRefs: string[];
  fieldSources: Record<string, FieldSource>;
  status: DatasetStatus;
  verification: VerificationStatus;
  deterministicHash: string;
  syntheticOnly: true;
}