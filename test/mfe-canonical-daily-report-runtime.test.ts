import test from 'node:test';
import assert from 'node:assert/strict';
import { collectMfeEvidenceToCanonicalDataset, canonicalDatasetToDailyGuardSnapshot, renderCanonicalDatasetWithExistingDailyGuardRenderer } from '../src/application/mfe-canonical-daily-report-runtime-adapter.js';
import { validateCanonicalDailyDataset } from '../src/application/canonical-daily-dataset-validation.js';
import type { FieldEvidence } from '../src/application/canonical-daily-dataset-contract.js';

const evidence: FieldEvidence[] = [
  { evidenceId:'MFE-E-001', eventType:'PEMERIKSAAN', capturedAt:'2026-09-26T07:10:00.000Z', actorId:'PETUGAS-01', rawNote:'Pemeriksaan blok A selesai.', sourceKind:'NOTE', includeInReport:true, photoRefs:['PHOTO-001'], sequence:1, syntheticOnly:true as const },
  { evidenceId:'MFE-E-002', eventType:'PERGERAKAN', capturedAt:'2026-09-26T08:20:00.000Z', actorId:'PETUGAS-02', location:'Blok A / Kamar 01', rawNote:'Pergerakan internal tercatat.', sourceKind:'DATA', includeInReport:true, photoRefs:[], sequence:2, syntheticOnly:true as const },
  { evidenceId:'MFE-E-003', eventType:'KEAMANAN', capturedAt:'2026-09-26T09:30:00.000Z', actorId:'PETUGAS-01', rawNote:'Kontrol keamanan rutin.', sourceKind:'VOICE', includeInReport:true, photoRefs:['PHOTO-002'], sequence:3, syntheticOnly:true as const },
];

test('MFE Evidence → Canonical Dataset → Validation → existing Daily Guard Renderer is deterministic', () => {
  const a = collectMfeEvidenceToCanonicalDataset({datasetId:'DSET-MFE-001',reportDate:'2026-09-26',shiftId:'SHIFT-PAGI',groupId:'BRAVO',evidence});
  const b = collectMfeEvidenceToCanonicalDataset({datasetId:'DSET-MFE-001',reportDate:'2026-09-26',shiftId:'SHIFT-PAGI',groupId:'BRAVO',evidence});
  assert.equal(validateCanonicalDailyDataset(a).valid,true);
  assert.equal(a.status,'APPROVED');
  assert.equal(a.verification,'VERIFIED');
  assert.equal(a.deterministicHash,b.deterministicHash);
  const snapshot = canonicalDatasetToDailyGuardSnapshot(a);
  assert.match(snapshot.sourceVersion,/MFE-CANONICAL-DAILY-v1/);
  assert.equal(snapshot.approvalBinding,a.deterministicHash);
  const r1 = renderCanonicalDatasetWithExistingDailyGuardRenderer(a);
  const r2 = renderCanonicalDatasetWithExistingDailyGuardRenderer(b);
  assert.equal(r1.rendererFormat,'DOCX');
  assert.equal(r1.render.content,r2.render.content);
  assert.match(r1.render.content,/Pemeriksaan blok A selesai/);
  assert.match(r1.render.content,/MFE-E-001/);
});