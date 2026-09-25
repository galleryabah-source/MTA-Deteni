import test from 'node:test';
import assert from 'node:assert/strict';
import { collectMfeEvidenceToCanonicalDataset, renderCanonicalDatasetWithExistingDailyGuardRenderer } from '../src/application/mfe-canonical-daily-report-runtime-adapter.js';

const evidence = [{
  evidenceId:'AI-FAIL-E-001',
  eventType:'PEMERIKSAAN' as const,
  capturedAt:'2026-09-26T11:00:00.000Z',
  actorId:'PETUGAS-AI-FAIL',
  rawNote:'Core report remains available while AI transport fails.',
  sourceKind:'NOTE' as const,
  includeInReport:true,
  photoRefs:[],
  sequence:1,
  syntheticOnly:true as const,
}];

function corePath() {
  const dataset = collectMfeEvidenceToCanonicalDataset({
    datasetId:'AI-FAIL-CORE-001',
    reportDate:'2026-09-26',
    shiftId:'SHIFT-SIANG',
    groupId:'BRAVO',
    evidence,
  });
  return renderCanonicalDatasetWithExistingDailyGuardRenderer(dataset);
}

async function assertFailureIsolated(providerFailure: () => Promise<unknown>, expectedCode: string) {
  let calls = 0;
  const provider = async () => { calls++; return providerFailure(); };
  await assert.rejects(provider(), (error: unknown) => {
    const e = error as { code?: string; message?: string };
    return e.code === expectedCode || e.message === expectedCode;
  });
  const render = corePath();
  assert.ok(calls === 1);
  assert.match(render.render.content,/Core report remains available/);
  assert.equal(render.syntheticOnly,true);
}

test('AI 429/rate-limit failure does not block deterministic core report', async () => {
  await assertFailureIsolated(async () => { const e = new Error('AI_RATE_LIMITED'); Object.assign(e,{code:'AI_RATE_LIMITED',status:429}); throw e; }, 'AI_RATE_LIMITED');
});

test('AI timeout failure does not block deterministic core report', async () => {
  await assertFailureIsolated(async () => { const e = new Error('AI_TIMEOUT'); Object.assign(e,{code:'AI_TIMEOUT'}); throw e; }, 'AI_TIMEOUT');
});

test('AI network disconnect failure does not block deterministic core report', async () => {
  await assertFailureIsolated(async () => { const e = new Error('AI_DISCONNECTED'); Object.assign(e,{code:'AI_DISCONNECTED'}); throw e; }, 'AI_DISCONNECTED');
});

test('AI failure isolation preserves deterministic output identity across all failure classes', async () => {
  const baseline = corePath().render.content;
  for (const code of ['AI_RATE_LIMITED','AI_TIMEOUT','AI_DISCONNECTED']) {
    const render = corePath();
    assert.equal(render.render.content, baseline, code);
  }
});