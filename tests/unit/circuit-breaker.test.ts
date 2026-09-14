import { describe, expect, it } from 'vitest';
import { CircuitBreaker, CircuitOpenError } from '../../src/lib/ai/circuit-breaker';

describe('CircuitBreaker', () => {
  it('opens after the configured failure threshold', async () => {
    const breaker = new CircuitBreaker('provider-a', { failureThreshold: 2, cooldownMs: 60_000 });
    await expect(breaker.execute(async () => { throw new Error('down'); })).rejects.toThrow('down');
    await expect(breaker.execute(async () => { throw new Error('down'); })).rejects.toThrow('down');
    expect(breaker.getState()).toBe('OPEN');
    await expect(breaker.execute(async () => 'must-not-run')).rejects.toBeInstanceOf(CircuitOpenError);
  });

  it('closes again after a successful half-open probe', async () => {
    const breaker = new CircuitBreaker('provider-a', { failureThreshold: 1, cooldownMs: 0 });
    await expect(breaker.execute(async () => { throw new Error('down'); })).rejects.toThrow('down');
    expect(breaker.getState()).toBe('HALF_OPEN');
    await expect(breaker.execute(async () => 'ok')).resolves.toBe('ok');
    expect(breaker.getState()).toBe('CLOSED');
  });
});
