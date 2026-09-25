import type { CanonicalDailyDataset } from './canonical-daily-dataset-contract.js';

export interface DatasetValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCanonicalDailyDataset(dataset: CanonicalDailyDataset): DatasetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataset.reportDate)) errors.push('REPORT_DATE_INVALID');
  if (!dataset.datasetId) errors.push('DATASET_ID_REQUIRED');
  if (!dataset.shiftId) errors.push('SHIFT_ID_REQUIRED');
  if (!dataset.groupId) errors.push('GROUP_ID_REQUIRED');
  if (!dataset.sourceEvidenceRefs.length) errors.push('EVIDENCE_REQUIRED');
  if (dataset.sourceEvidenceRefs.length !== new Set(dataset.sourceEvidenceRefs).size) errors.push('DUPLICATE_EVIDENCE_REFERENCE');
  for (const event of dataset.events) {
    if (!dataset.sourceEvidenceRefs.includes(event.evidenceRefs[0] ?? '')) errors.push(`EVENT_SOURCE_MISSING:${event.eventId}`);
    if (!event.actorId) errors.push(`EVENT_ACTOR_REQUIRED:${event.eventId}`);
    if (event.verification === 'REJECTED') errors.push(`EVENT_REJECTED:${event.eventId}`);
  }
  for (const photo of dataset.photos) {
    if (!photo.evidenceId) errors.push(`PHOTO_EVIDENCE_REQUIRED:${photo.imageSlot}`);
    if (photo.verification === 'REJECTED') errors.push(`PHOTO_REJECTED:${photo.imageSlot}`);
  }
  if (dataset.verification !== 'VERIFIED') warnings.push('DATASET_NOT_VERIFIED');
  return { valid: errors.length === 0, errors, warnings };
}
