export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  cooldownMs?: number;
}

export class CircuitOpenError extends Error {
  readonly code = 'PROVIDER_UNAVAILABLE';
  constructor(providerId: string) {
    super(`AI provider circuit is open: ${providerId}`);
    this.name = 'CircuitOpenError';
  }
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private openedAt = 0;
  private readonly threshold: number;
  private readonly cooldownMs: number;

  constructor(private readonly providerId: string, options: CircuitBreakerOptions = {}) {
    this.threshold = Math.max(1, options.failureThreshold ?? 3);
    this.cooldownMs = Math.max(0, options.cooldownMs ?? 30_000);
  }

  getState(now = Date.now()): CircuitState {
    if (this.state === 'OPEN' && now - this.openedAt >= this.cooldownMs) {
      this.state = 'HALF_OPEN';
    }
    return this.state;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const state = this.getState();
    if (state === 'OPEN') throw new CircuitOpenError(this.providerId);

    try {
      const value = await operation();
      this.recordSuccess();
      return value;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.openedAt = 0;
  }

  private recordFailure(): void {
    this.failures += 1;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.openedAt = Date.now();
    }
  }
}
