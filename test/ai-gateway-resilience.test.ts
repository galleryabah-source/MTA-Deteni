import test from 'node:test';
import assert from 'node:assert/strict';
import { AiGateway } from '../src/application/ai-gateway.js';
import { deterministicAiAccelerator } from '../src/application/ai-accelerator.js';

function failure(code: string, status?: number) {
  const e = new Error(code) as Error & { code?: string; status?: number };
  e.code = code;
  e.status = status;
  return e;
}

test('AI gateway classifies 429 and retries with bounded backoff', async () => {
  let calls = 0;
  const gateway = new AiGateway(
    { name: 'synthetic', async execute() { calls += 1; if (calls < 3) throw failure('AI_RATE_LIMITED', 429); return 'ok'; } },
    { maxRetries: 2, baseBackoffMs: 0, sleep: async () => undefined },
  );
  const result = await gateway.execute({ idempotencyKey:'AI-GATE-429', request:{} });
  assert.equal(result.ok, true);
  assert.equal(result.attempts, 3);
  assert.equal(calls, 3);
});

test('AI gateway converts timeout into AI_TIMEOUT without blocking core', async () => {
  const gateway = new AiGateway(
    { name: 'synthetic', async execute(_request, signal) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, 100);
        signal.addEventListener('abort', () => { clearTimeout(timer); reject(Object.assign(new Error('aborted'), { name:'AbortError' })); });
      });
      return 'never';
    } },
    { timeoutMs: 5, maxRetries: 0 },
  );
  const result = await gateway.execute({ idempotencyKey:'AI-GATE-TIMEOUT', request:{} });
  assert.equal(result.ok, false);
  assert.equal(result.status, 'AI_TIMEOUT');
});

test('AI gateway classifies network disconnect and opens circuit after threshold', async () => {
  let calls = 0;
  let now = 1000;
  const gateway = new AiGateway(
    { name:'synthetic', async execute() { calls += 1; throw failure('AI_DISCONNECTED'); } },
    { maxRetries:0, circuitFailureThreshold:2, circuitCooldownMs:100, now:() => now },
  );
  const first = await gateway.execute({ idempotencyKey:'AI-GATE-DISCONNECT-1', request:{} });
  const second = await gateway.execute({ idempotencyKey:'AI-GATE-DISCONNECT-2', request:{} });
  const third = await gateway.execute({ idempotencyKey:'AI-GATE-DISCONNECT-3', request:{} });
  assert.equal(first.status, 'AI_NETWORK_ERROR');
  assert.equal(second.status, 'AI_NETWORK_ERROR');
  assert.equal(third.status, 'AI_UNAVAILABLE');
  assert.equal(calls, 2);
  now += 101;
  assert.equal(gateway.circuitState, 'HALF_OPEN');
});

test('AI gateway idempotency prevents duplicate provider execution', async () => {
  let calls = 0;
  const gateway = new AiGateway(
    { name:'synthetic', async execute() { calls += 1; return { result:'accepted' }; } },
    { maxRetries:0 },
  );
  const a = await gateway.execute({ idempotencyKey:'AI-GATE-IDEMP-1', request:{x:1} });
  const b = await gateway.execute({ idempotencyKey:'AI-GATE-IDEMP-1', request:{x:1} });
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(calls, 1);
});

test('deterministic AI accelerator remains usable with AI completely unavailable', () => {
  const suggestions = deterministicAiAccelerator({
    eventType:'PEMERIKSAAN',
    capturedAt:'2026-09-26T12:00:00.000Z',
    actorId:'PETUGAS-01',
    location:'Blok A',
    rawNote:'Pemeriksaan rutin',
  });
  assert.equal(suggestions.every(x => x.source === 'DETERMINISTIC' && x.confidence === 1), true);
  assert.equal(suggestions.find(x => x.field === 'eventLabel')?.value, 'Pemeriksaan');
});
