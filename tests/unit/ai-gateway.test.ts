import { describe, expect, it } from 'vitest';
import { FailureIsolatedAiGateway } from '../../src/lib/ai/gateway';
import { DeterministicProvider } from '../../src/lib/ai/providers/deterministic';
import type { AiProvider } from '../../src/lib/ai/types';

const request = {
  capability: 'summary',
  input: { text: 'synthetic test' },
  correlationId: 'test-correlation',
  timeoutMs: 20,
};

describe('FailureIsolatedAiGateway', () => {
  it('returns controlled unavailable result when AI is disabled', async () => {
    const gateway = new FailureIsolatedAiGateway({ providers: [], aiMode: 'disabled' });
    const result = await gateway.execute(request);
    expect(result.outcome).toBe('PROVIDER_ERROR');
    expect(result.failure.code).toBe('GATEWAY_FAILURE');
  });

  it('uses the next provider after a provider failure', async () => {
    const broken: AiProvider = {
      id: 'external-broken', kind: 'external', capabilities: ['summary'],
      async execute() { throw new Error('network connection failed'); },
    };
    const fallback = new DeterministicProvider('deterministic', {
      summary: () => ({ text: 'deterministic result' }),
    });
    const gateway = new FailureIsolatedAiGateway({
      providers: [broken, fallback], retryAttempts: 1, circuitFailureThreshold: 2,
    });
    const result = await gateway.execute<typeof request.input, { text: string }>(request);
    expect(result.outcome).toBe('FALLBACK_USED');
    expect(result.value.text).toBe('deterministic result');
  });

  it('does not allow an external provider when explicitly disallowed', async () => {
    const external: AiProvider = {
      id: 'external', kind: 'external', capabilities: ['summary'],
      async execute() { return 'must not run'; },
    };
    const gateway = new FailureIsolatedAiGateway({ providers: [external] });
    const result = await gateway.execute({ ...request, allowExternal: false });
    expect(result.outcome).toBe('UNAVAILABLE');
  });
});
