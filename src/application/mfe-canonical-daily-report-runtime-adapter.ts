import type { CanonicalDailyDataset, FieldEvidence } from './canonical-daily-dataset-contract.js';
import { buildCanonicalDailyDataset, verifyCanonicalDailyDataset } from './deterministic-daily-report-engine.js';
import { validateCanonicalDailyDataset } from './canonical-daily-dataset-validation.js';
import { DAILY_GUARD_SECTION_ORDER } from './daily-guard-report-contract.js';
import { renderDailyGuardReport } from './daily-guard-report-renderer.js';
import { SYNTHETIC_DOCX_RENDERER } from './daily-guard-report-render-adapters.js';
import type { ReportSnapshot } from './report-artifact.js';

export type MfeEvidenceInput = Readonly<FieldEvidence>;

export type DailyGuardWebReportInput = Readonly<{
  documentId: string;
  documentType: 'DAILY_GUARD_REPORT';
  reportDate: string;
  officeId: string;
  reguId: string;
  shiftId: string;
  startAt: string;
  status: 'GENERATED';
  templateVersion: 'DAILY-GUARD-v1.1';
  generatedAt: string;
  sourceRecordIds: readonly string[];
  addressees: readonly { id: string; label: string }[];
  handover: Readonly<{ incomingRegu: string; shift: string; attendanceStatus: string; note: string }>;
  blockControl: readonly { id: string }[];
  guardPost: readonly { id: string }[];
  detaineeActivity: readonly { id: string }[];
  escortActivity: readonly { id: string }[];
  mealDistribution: readonly { id: string }[];
  endHandover: Readonly<{ id: string }>;
  signatories: readonly { role: string; name: string; identifier: string }[];
  photos: readonly {
    id: string;
    status: string;
    templatePlacement: string;
  }[];
  sections: Readonly<{
    cover: Readonly<Record<string, never>>;
    addressee: Readonly<{ text: string }>;
    handover: Readonly<{ incomingRegu: string; shift: string; attendanceStatus: string; note: string }>;
    block_control: Readonly<{ time: string; headcount: number; result: string }>;
    guard_post: Readonly<{ activity: string; result: string }>;
    activity: Readonly<{ description: string; time: string; location: string; result: string }>;
    escort: Readonly<{ count: number; destination: string; purpose: string; activity: string }>;
    meal: Readonly<{ time: string; result: string; distributionStatus: string }>;
    end_handover: Readonly<{ time: string; incomingRegu: string; condition: string; outstandingIssues: string }>;
    closing: Readonly<{ statement: string }>;
    closing_page: Readonly<Record<string, never>>;
  }>;
  integrityHash: string;
}>;

export function collectMfeEvidenceToCanonicalDataset(input: Readonly<{
  datasetId: string;
  reportDate: string;
  shiftId: string;
  groupId: string;
  evidence: readonly MfeEvidenceInput[];
}>): CanonicalDailyDataset {
  const draft = buildCanonicalDailyDataset(input);
  const validation = validateCanonicalDailyDataset(draft);
  if (!validation.valid) throw new Error('MFE_CANONICAL_DATASET_INVALID:' + validation.errors.join(','));
  return verifyCanonicalDailyDataset(draft);
}

export function canonicalDatasetToDailyGuardSnapshot(dataset: CanonicalDailyDataset): ReportSnapshot {
  if (dataset.status !== 'APPROVED' || dataset.verification !== 'VERIFIED') throw new Error('MFE_DATASET_NOT_APPROVED');
  const events = dataset.events.map((event, index) =>
    `${String(index + 1).padStart(2, '0')}. [${event.eventType}] ${event.occurredAt} · ${event.actorId} · ${event.location ?? '—'} · ${event.note ?? '—'} · evidence=${event.evidenceRefs.join(',')}`
  ).join('\n');
  const photos = dataset.photos.map(photo =>
    `${photo.imageSlot} · evidence=${photo.evidenceId} · ${photo.caption}`
  ).join('\n') || 'Tidak ada foto yang disertakan.';
  const narrative = dataset.narrative.join('\n') || 'Tidak ada narasi tambahan.';
  const snapshotId = 'DGR-SNAPSHOT-' + dataset.deterministicHash.slice(0, 16);
  const documentNumber = 'DGR-' + dataset.reportDate.replaceAll('-', '') + '-' + dataset.shiftId;
  const sections: Record<string,string> = {
    IDENTITAS_LAPORAN: `Tanggal: ${dataset.reportDate}\nRegu: ${dataset.groupId}\nShift: ${dataset.shiftId}\nDataset: ${dataset.datasetId}\nDataset Hash: ${dataset.deterministicHash}`,
    PERSONEL_REGU: 'Personel bersumber dari actor evidence yang telah diverifikasi.\n' + [...new Set(dataset.events.map(e => e.actorId))].sort().join('\n'),
    KONDISI_DETENI: `Event evidentiary: ${dataset.events.length}\nFoto evidentiary: ${dataset.photos.length}\nVerification: ${dataset.verification}`,
    KEGIATAN_JAGA: events || 'Tidak ada kegiatan tercatat.',
    KEJADIAN_PENTING: dataset.events.filter(e => e.eventType === 'KEJADIAN' || e.eventType === 'KEAMANAN').map(e => e.note || e.eventId).join('\n') || 'Tidak ada kejadian penting yang tercatat.',
    SERAH_TERIMA: `Evidence refs: ${dataset.sourceEvidenceRefs.join(', ')}\nFoto:\n${photos}\nNarasi:\n${narrative}`,
    PENGESAHAN: `Status dataset: ${dataset.status}\nVerification: ${dataset.verification}\nDeterministic hash: ${dataset.deterministicHash}\nApproval binding: ${dataset.deterministicHash}`,
  };
  return Object.freeze({ snapshotId, sourceVersion: 'MFE-CANONICAL-DAILY-v1', documentNumber, approvalBinding: dataset.deterministicHash, provenance: Object.freeze(['MFE_FIELD_EVIDENCE', ...dataset.sourceEvidenceRefs, 'CANONICAL_DAILY_DATASET:' + dataset.deterministicHash]), sections: Object.freeze(sections) });
}

export function canonicalDatasetToDailyGuardWebReportInput(dataset: CanonicalDailyDataset): DailyGuardWebReportInput {
  if (dataset.status !== 'APPROVED' || dataset.verification !== 'VERIFIED') throw new Error('MFE_DATASET_NOT_APPROVED');
  const times = dataset.events.map(event => event.occurredAt).sort();
  const firstTime = times[0] ?? dataset.reportDate + 'T00:00:00.000Z';
  const lastTime = times[times.length - 1] ?? firstTime;
  const activities = dataset.events.filter(event => event.eventType !== 'KEJADIAN' && event.eventType !== 'KEAMANAN');
  const securityEvents = dataset.events.filter(event => event.eventType === 'KEJADIAN' || event.eventType === 'KEAMANAN');
  const photos = dataset.photos.map(photo => Object.freeze({
    id: photo.imageSlot,
    status: 'VERIFIED',
    templatePlacement: 'activity',
  }));
  const photoIds = dataset.photos.map(photo => photo.evidenceId);
  const report: DailyGuardWebReportInput = {
    documentId: 'DGR-' + dataset.deterministicHash.slice(0, 16),
    documentType: 'DAILY_GUARD_REPORT',
    reportDate: dataset.reportDate,
    officeId: 'MTA-SYNTHETIC-OFFICE',
    reguId: dataset.groupId,
    shiftId: dataset.shiftId,
    startAt: firstTime,
    status: 'GENERATED',
    templateVersion: 'DAILY-GUARD-v1.1',
    generatedAt: lastTime,
    sourceRecordIds: Object.freeze([...dataset.sourceEvidenceRefs]),
    addressees: Object.freeze([{ id: 'SYN-ADDRESSEE', label: 'Synthetic verified operational report' }]),
    handover: Object.freeze({
      incomingRegu: dataset.groupId,
      shift: dataset.shiftId,
      attendanceStatus: 'VERIFIED',
      note: 'MFE evidence dataset ' + dataset.datasetId + ' verified.',
    }),
    blockControl: Object.freeze([{ id: 'SYN-BLOCK-' + dataset.deterministicHash.slice(0, 8) }]),
    guardPost: Object.freeze([{ id: 'SYN-POST-' + dataset.deterministicHash.slice(8, 16) }]),
    detaineeActivity: Object.freeze([{ id: 'SYN-ACT-' + dataset.events.length }]),
    escortActivity: Object.freeze([{ id: 'SYN-ESC-0' }]),
    mealDistribution: Object.freeze([{ id: 'SYN-MEAL-0' }]),
    endHandover: Object.freeze({ id: 'SYN-END-' + dataset.deterministicHash.slice(16, 24) }),
    signatories: Object.freeze([{ role: 'Komandan Jaga', name: 'SYNTHETIC VERIFIED OFFICER', identifier: 'SYNTHETIC' }]),
    photos,
    sections: Object.freeze({
      cover: Object.freeze({}),
      addressee: Object.freeze({ text: 'Dataset ' + dataset.datasetId + ' · hash ' + dataset.deterministicHash }),
      handover: Object.freeze({
        incomingRegu: dataset.groupId,
        shift: dataset.shiftId,
        attendanceStatus: 'VERIFIED',
        note: dataset.sourceEvidenceRefs.join(', '),
      }),
      block_control: Object.freeze({
        time: firstTime,
        headcount: dataset.events.length,
        result: 'Verified evidence events: ' + dataset.events.length,
      }),
      guard_post: Object.freeze({
        activity: 'Evidence refs: ' + dataset.sourceEvidenceRefs.join(', '),
        result: 'Verified',
      }),
      activity: Object.freeze({
        description: activities.map(event => event.note ?? event.eventId).join(' | ') || 'Tidak ada aktivitas operasional.',
        time: firstTime,
        location: activities.map(event => event.location ?? '—').join(' | ') || '—',
        result: 'Verified from canonical evidence',
      }),
      escort: Object.freeze({
        count: dataset.events.filter(event => event.eventType === 'PENGAWALAN').length,
        destination: 'Evidence-bound',
        purpose: 'Evidence-bound operational activity',
        activity: dataset.events.filter(event => event.eventType === 'PENGAWALAN').map(event => event.note ?? event.eventId).join(' | ') || 'Tidak ada pengawalan tercatat.',
      }),
      meal: Object.freeze({
        time: lastTime,
        result: 'No independent meal evidence in this dataset',
        distributionStatus: 'Evidence-bound / not asserted',
      }),
      end_handover: Object.freeze({
        time: lastTime,
        incomingRegu: dataset.groupId,
        condition: 'Dataset verified',
        outstandingIssues: securityEvents.map(event => event.note ?? event.eventId).join(' | ') || 'Tidak ada kejadian keamanan yang tercatat.',
      }),
      closing: Object.freeze({
        statement: 'Generated from approved canonical dataset ' + dataset.datasetId + ' with deterministic hash ' + dataset.deterministicHash + '.',
      }),
      closing_page: Object.freeze({}),
    }),
    integrityHash: dataset.deterministicHash,
  };
  if (photoIds.length > 0 && report.photos.length !== photoIds.length) throw new Error('MFE_PHOTO_BINDING_MISMATCH');
  return Object.freeze(report);
}

export function renderCanonicalDatasetWithExistingDailyGuardRenderer(dataset: CanonicalDailyDataset) {
  const snapshot = canonicalDatasetToDailyGuardSnapshot(dataset);
  return renderDailyGuardReport({ snapshot, sectionOrder: DAILY_GUARD_SECTION_ORDER, renderer: SYNTHETIC_DOCX_RENDERER });
}
