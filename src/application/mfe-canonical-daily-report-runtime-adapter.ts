import type { CanonicalDailyDataset, FieldEvidence } from './canonical-daily-dataset-contract.js';
import { buildCanonicalDailyDataset, verifyCanonicalDailyDataset } from './deterministic-daily-report-engine.js';
import { validateCanonicalDailyDataset } from './canonical-daily-dataset-validation.js';
import { DAILY_GUARD_SECTION_ORDER } from './daily-guard-report-contract.js';
import { renderDailyGuardReport } from './daily-guard-report-renderer.js';
import { SYNTHETIC_DOCX_RENDERER } from './daily-guard-report-render-adapters.js';
import type { ReportSnapshot } from './report-artifact.js';

export type MfeEvidenceInput = Readonly<FieldEvidence>;

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

export function renderCanonicalDatasetWithExistingDailyGuardRenderer(dataset: CanonicalDailyDataset) {
  const snapshot = canonicalDatasetToDailyGuardSnapshot(dataset);
  return renderDailyGuardReport({ snapshot, sectionOrder: DAILY_GUARD_SECTION_ORDER, renderer: SYNTHETIC_DOCX_RENDERER });
}
