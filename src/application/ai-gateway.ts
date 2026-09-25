export type AiGatewayFailureCode =
  | 'AI_TIMEOUT'
  | 'AI_RATE_LIMITED'
  | 'AI_QUOTA_EXHAUSTED'
  | 'AI_UNAVAILABLE'
  | 'AI_INVALID_CREDENTIAL'
  | 'AI_MODEL_UNAVAILABLE'
  | 'AI_NETWORK_ERROR'
  | 'AI_POLICY_BLOCKED';

export type AiGatewayOutcome<T> =
  | { ok: true; status: 'SUCCESS'; value: T; attempts: number }
  | { ok: false; status: AiGatewayFailureCode; error: Error; attempts: number };

export type AiProvider<TRequest, TResult> = Readonly<{
  name: string;
  execute: (request: TRequest, signal: AbortSignal) => Promise<TResult>;
}>;

export type AiGatewayOptions = Readonly<{
  timeoutMs?: number;
  maxRetries?: number;
  baseBackoffMs?: number;
  circuitFailureThreshold?: number;
  circuitCooldownMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}>;

export type AiGatewayRequest<TRequest> = Readonly<{
  idempotencyKey: string;
  request: TRequest;
}>;

const DEFAULTS = Object.freeze({
  timeoutMs: 2500,
  maxRetries: 2,
  baseBackoffMs: 25,
  circuitFailureThreshold: 3,
  circuitCooldownMs: 1000,
});

function errorWithCode(code: AiGatewayFailureCode, cause?: unknown): Error & { code: AiGatewayFailureCode } {
  const error = new Error(code, cause instanceof Error ? { cause } : undefined) as Error & { code: AiGatewayFailureCode };
  error.code = code;
  return error;
}

function classifyFailure(error: unknown): AiGatewayFailureCode {
  const e = error as { code?: string; status?: number; name?: string; message?: string };
  if (e.code && ['AI_TIMEOUT','AI_RATE_LIMITED','AI_QUOTA_EXHAUSTED','AI_UNAVAILABLE','AI_INVALID_CREDENTIAL','AI_MODEL_UNAVAILABLE','AI_NETWORK_ERROR','AI_POLICY_BLOCKED'].includes(e.code)) {
    return e.code as AiGatewayFailureCode;
  }
  if (e.status === 429) return 'AI_RATE_LIMITED';
  if (e.status === 401 || e.status === 403) return 'AI_INVALID_CREDENTIAL';
  if (e.status === 408 || e.name === 'AbortError' || /timeout/i.test(e.message ?? '')) return 'AI_TIMEOUT';
  if (e.status === 404 || /model.*(not|unavailable)/i.test(e.message ?? '')) return 'AI_MODEL_UNAVAILABLE';
  if (e.status === 402 || /quota/i.test(e.message ?? '')) return 'AI_QUOTA_EXHAUSTED';
  if (e.status !== undefined && e.status >= 500) return 'AI_UNAVAILABLE';
  return 'AI_NETWORK_ERROR';
}

function retryable(code: AiGatewayFailureCode): boolean {
  return code === 'AI_TIMEOUT' || code === 'AI_RATE_LIMITED' || code === 'AI_QUOTA_EXHAUSTED' ||
    code === 'AI_UNAVAILABLE' || code === 'AI_NETWORK_ERROR';
}

export class AiGateway<TRequest, TResult> {
  private readonly options: Required<AiGatewayOptions>;
  private failures = 0;
  private openedAt = 0;
  private readonly completed = new Map<string, TResult>();
  private readonly inFlight = new Map<string, Promise<AiGatewayOutcome<TResult>>>();

  constructor(private readonly provider: AiProvider<TRequest, TResult>, options: AiGatewayOptions = {}) {
    this.options = {
      timeoutMs: options.timeoutMs ?? DEFAULTS.timeoutMs,
      maxRetries: options.maxRetries ?? DEFAULTS.maxRetries,
      baseBackoffMs: options.baseBackoffMs ?? DEFAULTS.baseBackoffMs,
      circuitFailureThreshold: options.circuitFailureThreshold ?? DEFAULTS.circuitFailureThreshold,
      circuitCooldownMs: options.circuitCooldownMs ?? DEFAULTS.circuitCooldownMs,
      now: options.now ?? (() => Date.now()),
      sleep: options.sleep ?? ((ms) => new Promise(resolve => setTimeout(resolve, ms))),
    };
  }

  get circuitState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    if (this.openedAt === 0) return 'CLOSED';
    return this.options.now() - this.openedAt >= this.options.circuitCooldownMs ? 'HALF_OPEN' : 'OPEN';
  }

  async execute(input: AiGatewayRequest<TRequest>): Promise<AiGatewayOutcome<TResult>> {
    if (!input.idempotencyKey.trim()) throw new Error('AI_IDEMPOTENCY_KEY_REQUIRED');
    const cached = this.completed.get(input.idempotencyKey);
    if (cached !== undefined) return { ok: true, status: 'SUCCESS', value: cached, attempts: 0 };
    const existing = this.inFlight.get(input.idempotencyKey);
    if (existing) return existing;
    if (this.circuitState === 'OPEN') {
      return { ok: false, status: 'AI_UNAVAILABLE', error: errorWithCode('AI_UNAVAILABLE'), attempts: 0 };
    }
    const run = this.run(input);
    this.inFlight.set(input.idempotencyKey, run);
    try {
      return await run;
    } finally {
      this.inFlight.delete(input.idempotencyKey);
    }
  }

  private async run(input: AiGatewayRequest<TRequest>): Promise<AiGatewayOutcome<TResult>> {
    let attempts = 0;
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt += 1) {
      attempts += 1;
      try {
        const value = await this.withTimeout(input.request);
        this.failures = 0;
        this.openedAt = 0;
        this.completed.set(input.idempotencyKey, value);
        return { ok: true, status: 'SUCCESS', value, attempts };
      } catch (raw) {
        const code = classifyFailure(raw);
        const error = errorWithCode(code, raw);
        if (!retryable(code) || attempt >= this.options.maxRetries) {
          this.failures += 1;
          if (this.failures >= this.options.circuitFailureThreshold) this.openedAt = this.options.now();
          return { ok: false, status: code, error, attempts };
        }
        await this.options.sleep(this.options.baseBackoffMs * (2 ** attempt));
      }
    }
    return { ok: false, status: 'AI_UNAVAILABLE', error: errorWithCode('AI_UNAVAILABLE'), attempts };
  }

  private async withTimeout(request: TRequest): Promise<TResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs);
    try {
      return await this.provider.execute(request, controller.signal);
    } finally {
      clearTimeout(timer);
    }
  }
}
