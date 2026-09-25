import { createHash } from 'node:crypto';
import type {
  CanonicalDailyDataset, DailyReportEvent, DailyReportPhoto, EventType, FieldEvidence, VerificationStatus
} from './canonical-daily-dataset-contract.js';

const EVENT_TYPES = new Set<EventType>([
  'PEMERIKSAAN','PENGAWALAN','PERGERAKAN','APEL_HEADCOUNT','KUNJUNGAN','KEAMANAN','PELAYANAN','KEJADIAN','LAINNYA'
]);

function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, v) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return v;
    return Object.fromEntries(Object.keys(v as Record<string, unknown>).sort().map(k => [k, (v as Record<string, unknown>)[k]]));
  });
}

function hashDataset(input: Omit<CanonicalDailyDataset, 'deterministicHash'>): string {
  return createHash('sha256').update(stableJson(input)).digest('hex');
}

function captionFor(evidence: FieldEvidence, sequence: number): string {
  const note = evidence.rawNote?.trim();
  if (note) return note;
  return `${evidence.eventType.replaceAll('_', ' ')} — ${evidence.capturedAt} — evidence ${sequence}`;
}

export function normalizeFieldEvidence(evidence: readonly FieldEvidence[]): FieldEvidence[] {
  return [...evidence]
    .map(e => ({ ...e, eventType: EVENT_TYPES.has(e.eventType) ? e.eventType : 'LAINNYA' }))
    .sort((a,b) => a.capturedAt.localeCompare(b.capturedAt) || (a.sequence ?? 0) - (b.sequence ?? 0) || a.evidenceId.localeCompare(b.evidenceId));
}

export function buildCanonicalDailyDataset(input: {
  datasetId: string;
  reportDate: string;
  shiftId: string;
  groupId: string;
  evidence: readonly FieldEvidence[];
}): CanonicalDailyDataset {
  const evidence = normalizeFieldEvidence(input.evidence);
  const events: DailyReportEvent[] = evidence.map((e, i) => ({
    eventId: e.eventRef ?? `EVT-${input.datasetId}-${String(i + 1).padStart(3,'0')}`,
    evidenceRefs: [e.evidenceId],
    eventType: e.eventType,
    occurredAt: e.capturedAt,
    actorId: e.actorId,
    ...(e.location ? { location: e.location } : {}),
    ...(e.rawNote ? { note: e.rawNote.trim() } : {}),
    verification: 'UNVERIFIED' as VerificationStatus
  }));

  const photos: DailyReportPhoto[] = [];
  let photoSequence = 1;
  for (const e of evidence) {
    if (!e.includeInReport || !e.photoRefs?.length) continue;
    for (const photoRef of e.photoRefs) {
      photos.push({
        evidenceId: photoRef,
        imageSlot: `foto_${String(photoSequence).padStart(2,'0')}`,
        sequence: photoSequence,
        caption: captionFor(e, photoSequence),
        verification: 'UNVERIFIED'
      });
      photoSequence++;
    }
  }

  const counts: Record<string, number> = {};
  for (const e of evidence) counts[e.eventType] = (counts[e.eventType] ?? 0) + 1;

  const base: Omit<CanonicalDailyDataset, 'deterministicHash'> = {
    datasetId: input.datasetId,
    reportDate: input.reportDate,
    shiftId: input.shiftId,
    groupId: input.groupId,
    events,
    photos,
    counts,
    narrative: evidence.filter(e => !!e.rawNote).map(e => e.rawNote!.trim()),
    sourceEvidenceRefs: evidence.map(e => e.evidenceId),
    fieldSources: {
      reportDate: 'SYSTEM',
      shiftId: 'HUMAN',
      groupId: 'HUMAN',
      events: 'EVIDENCE',
      photos: 'EVIDENCE',
      counts: 'EVIDENCE',
      narrative: 'EVIDENCE'
    },
    status: 'DRAFT',
    verification: 'UNVERIFIED',
    syntheticOnly: true
  };
  return { ...base, deterministicHash: hashDataset(base) };
}

export function verifyCanonicalDailyDataset(dataset: CanonicalDailyDataset): CanonicalDailyDataset {
  const verifiedEvents = dataset.events.map(e => ({ ...e, verification: 'VERIFIED' as const }));
  const verifiedPhotos = dataset.photos.map(p => ({ ...p, verification: 'VERIFIED' as const }));
  const nextBase: Omit<CanonicalDailyDataset, 'deterministicHash'> = {
    ...dataset,
    events: verifiedEvents,
    photos: verifiedPhotos,
    status: 'APPROVED',
    verification: 'VERIFIED'
  };
  return { ...nextBase, deterministicHash: hashDataset(nextBase) };
}

export interface DailyReportRenderPlan {
  rendererContract: 'DAILY-GUARD-v1.1';
  templateId: string;
  templateVersion: string;
  datasetId: string;
  datasetHash: string;
  reportDate: string;
  shiftId: string;
  groupId: string;
  eventRows: DailyReportEvent[];
  imageSlots: DailyReportPhoto[];
  narrative: string[];
  pageCount: number;
  outputHash: string;
  syntheticOnly: true;
}

export function renderDailyReportPlan(input: {
  dataset: CanonicalDailyDataset;
  templateId: string;
  templateVersion: string;
  rowsPerPage?: number;
  imagesPerPage?: number;
}): DailyReportRenderPlan {
  const rowsPerPage = input.rowsPerPage ?? 8;
  const imagesPerPage = input.imagesPerPage ?? 4;
  if (rowsPerPage < 1 || imagesPerPage < 1) throw new Error('Invalid deterministic pagination contract');
  const pages = Math.max(
    1,
    Math.ceil(input.dataset.events.length / rowsPerPage),
    Math.ceil(input.dataset.photos.length / imagesPerPage)
  );
  const planBase = {
    rendererContract: 'DAILY-GUARD-v1.1' as const,
    templateId: input.templateId,
    templateVersion: input.templateVersion,
    datasetId: input.dataset.datasetId,
    datasetHash: input.dataset.deterministicHash,
    reportDate: input.dataset.reportDate,
    shiftId: input.dataset.shiftId,
    groupId: input.dataset.groupId,
    eventRows: input.dataset.events,
    imageSlots: input.dataset.photos,
    narrative: input.dataset.narrative,
    pageCount: pages,
    syntheticOnly: true as const
  };
  return {
    ...planBase,
    outputHash: createHash('sha256').update(stableJson(planBase)).digest('hex')
  };
}

export function assertDeterministicReportPlan(a: DailyReportRenderPlan, b: DailyReportRenderPlan): void {
  if (a.outputHash !== b.outputHash) throw new Error('DETERMINISM_FAILURE: identical dataset/template produced different output hash');
}
