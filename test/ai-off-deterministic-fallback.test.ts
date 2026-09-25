import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { collectMfeEvidenceToCanonicalDataset, renderCanonicalDatasetWithExistingDailyGuardRenderer } from '../src/application/mfe-canonical-daily-report-runtime-adapter.js';

const evidence = [{
  evidenceId:'AI-OFF-E-001',
  eventType:'PEMERIKSAAN' as const,
  capturedAt:'2026-09-26T10:00:00.000Z',
  actorId:'PETUGAS-AI-OFF',
  rawNote:'Pemeriksaan tetap dapat dilaporkan tanpa AI.',
  sourceKind:'NOTE' as const,
  includeInReport:true,
  photoRefs:[],
  sequence:1,
  syntheticOnly:true as const,
}];

test('AI OFF: deterministic MFE → canonical dataset → Daily Guard renderer remains fully operational', () => {
  const previous = process.env.MTA_AI_ENABLED;
  process.env.MTA_AI_ENABLED = 'false';
  try {
    const dataset = collectMfeEvidenceToCanonicalDataset({
      datasetId:'AI-OFF-DATASET-001',
      reportDate:'2026-09-26',
      shiftId:'SHIFT-PAGI',
      groupId:'BRAVO',
      evidence,
    });
    const render = renderCanonicalDatasetWithExistingDailyGuardRenderer(dataset);
    assert.equal(dataset.status,'APPROVED');
    assert.equal(dataset.verification,'VERIFIED');
    assert.equal(render.syntheticOnly,true);
    assert.match(render.render.content,/Pemeriksaan tetap dapat dilaporkan tanpa AI/);
  } finally {
    if(previous === undefined) delete process.env.MTA_AI_ENABLED;
    else process.env.MTA_AI_ENABLED = previous;
  }
});

test('AI OFF: deterministic reporting path has no provider SDK dependency', async () => {
  const sources = await Promise.all([
    readFile(new URL('../src/application/mfe-canonical-daily-report-runtime-adapter.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/application/deterministic-daily-report-engine.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/application/daily-guard-report-renderer.ts', import.meta.url), 'utf8'),
  ]);
  for (const source of sources) {
    assert.doesNotMatch(source, /from ['"](?:openai|@google\/generative-ai|anthropic|@anthropic-ai|cohere-ai)['"]/i);
    assert.doesNotMatch(source, /fetch\(.*(?:openai|googleapis|anthropic|cohere)/is);
  }
});

test('AI OFF: provider/network failure cannot block deterministic core path', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => { throw new Error('SYNTHETIC_AI_PROVIDER_UNAVAILABLE'); }) as typeof fetch;
  try {
    const dataset = collectMfeEvidenceToCanonicalDataset({
      datasetId:'AI-OFF-NETWORK-001',
      reportDate:'2026-09-26',
      shiftId:'SHIFT-PAGI',
      groupId:'BRAVO',
      evidence,
    });
    const render = renderCanonicalDatasetWithExistingDailyGuardRenderer(dataset);
    assert.ok(render.render.content.length > 0);
    assert.equal(dataset.verification,'VERIFIED');
  } finally {
    globalThis.fetch = originalFetch;
  }
});