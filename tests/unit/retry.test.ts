import { describe, expect, it } from 'vitest';
import { withBoundedRetry } from '../../src/lib/ai/retry';

describe('withBoundedRetry', () => {
  it('retries only up to the configured attempt count', async () => {
    let attempts = 0;
    await expect(withBoundedRetry(
      async () => { attempts += 1; throw new Error('temporary'); },
      () => true,
      { maxAttempts: 3, sleep: async () => undefined },
    )).rejects.toThrow('temporary');
    expect(attempts).toBe(3);
  });

  it('does not retry a non-retryable failure', async () => {
    let attempts = 0;
    await expect(withBoundedRetry(
      async () => { attempts += 1; throw new Error('permanent'); },
      () => false,
      { maxAttempts: 5, sleep: async () => undefined },
    )).rejects.toThrow('permanent');
    expect(attempts).toBe(1);
  });
});
