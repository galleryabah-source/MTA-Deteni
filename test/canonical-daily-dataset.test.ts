import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCanonicalDailyDataset, renderDailyReportPlan, verifyCanonicalDailyDataset } from '../src/application/deterministic-daily-report-engine.js';
import { validateCanonicalDailyDataset } from '../src/application/canonical-daily-dataset-validation.js';
import type { FieldEvidence } from '../src/application/canonical-daily-dataset-contract.js';

const evidence: FieldEvidence[] = [
  { evidenceId:'E-02', eventType:'APEL_HEADCOUNT', capturedAt:'2026-09-25T20:00:00.000Z', actorId:'PET-01', rawNote:'Apel malam 18 deteni', photoRefs:['PHOTO-02'], includeInReport:true, sequence:2, sourceKind:'PHOTO', syntheticOnly:true },
  { evidenceId:'E-01', eventType:'KEAMANAN', capturedAt:'2026-09-25T19:00:00.000Z', actorId:'PET-01', rawNote:'Pemeriksaan area blok', photoRefs:['PHOTO-01'], includeInReport:true, sequence:1, sourceKind:'PHOTO', syntheticOnly:true }
];

test('field evidence deterministically converges into canonical dataset',()=>{
  const d=buildCanonicalDailyDataset({datasetId:'DS-001',reportDate:'2026-09-25',shiftId:'SHIFT-MALAM',groupId:'REGU-A',evidence});
  const v=validateCanonicalDailyDataset(d);
  assert.equal(v.valid,true);
  assert.equal(d.events[0]?.evidenceRefs[0],'E-01');
  assert.equal(d.photos[0]?.imageSlot,'foto_01');
});

test('AI is not required for dataset creation',()=>{
  const d=buildCanonicalDailyDataset({datasetId:'DS-002',reportDate:'2026-09-25',shiftId:'SHIFT-MALAM',groupId:'REGU-A',evidence});
  assert.equal(d.status,'DRAFT');
  assert.equal(d.verification,'UNVERIFIED');
  assert.equal(d.fieldSources.events,'EVIDENCE');
});

test('human verification produces approved dataset',()=>{
  const d=verifyCanonicalDailyDataset(buildCanonicalDailyDataset({datasetId:'DS-003',reportDate:'2026-09-25',shiftId:'SHIFT-MALAM',groupId:'REGU-A',evidence}));
  assert.equal(d.status,'APPROVED');
  assert.equal(validateCanonicalDailyDataset(d).valid,true);
});

test('same approved dataset and template produce identical render plan',()=>{
  const d=verifyCanonicalDailyDataset(buildCanonicalDailyDataset({datasetId:'DS-004',reportDate:'2026-09-25',shiftId:'SHIFT-MALAM',groupId:'REGU-A',evidence}));
  const a=renderDailyReportPlan({dataset:d,templateId:'TPL-DAILY-GUARD',templateVersion:'1.1'});
  const b=renderDailyReportPlan({dataset:d,templateId:'TPL-DAILY-GUARD',templateVersion:'1.1'});
  assert.equal(a.outputHash,b.outputHash);
  assert.equal(a.pageCount,1);
});

test('pagination is deterministic',()=>{
  const many=Array.from({length:9},(_,i)=>({...evidence[0]!,evidenceId:`E-${i}`,sequence:i}));
  const d=verifyCanonicalDailyDataset(buildCanonicalDailyDataset({datasetId:'DS-005',reportDate:'2026-09-25',shiftId:'SHIFT-MALAM',groupId:'REGU-A',evidence:many}));
  const plan=renderDailyReportPlan({dataset:d,templateId:'TPL-DAILY-GUARD',templateVersion:'1.1',rowsPerPage:8});
  assert.equal(plan.pageCount,3);
});
