import { CircuitBreaker, CircuitOpenError } from './circuit-breaker';
import { classifyAiError } from './errors';
import { withBoundedRetry } from './retry';
import type { AiFailure, AiGateway, AiProvider, AiRequest, AiResult } from './types';

export interface AiGatewayOptions {
  providers: readonly AiProvider[];
  timeoutMs?: number;
  retryAttempts?: number;
  circuitFailureThreshold?: number;
  circuitCooldownMs?: number;
  aiMode?: 'enabled' | 'disabled';
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`AI operation timed out after ${timeoutMs}ms`)), timeoutMs);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

export class FailureIsolatedAiGateway implements AiGateway {
  private readonly breakers = new Map<string, CircuitBreaker>();
  private readonly options: Required<Pick<AiGatewayOptions, 'timeoutMs' | 'retryAttempts' | 'circuitFailureThreshold' | 'circuitCooldownMs'>>;

  constructor(private readonly config: AiGatewayOptions) {
    this.options = {
      timeoutMs: config.timeoutMs ?? 5_000,
      retryAttempts: Math.max(1, config.retryAttempts ?? 2),
      circuitFailureThreshold: Math.max(1, config.circuitFailureThreshold ?? 3),
      circuitCooldownMs: Math.max(0, config.circuitCooldownMs ?? 30_000),
    };
  }

  async execute<TInput, TOutput>(request: AiRequest<TInput>): Promise<AiResult<TOutput>> {
    const started = Date.now();
    if (this.config.aiMode === 'disabled') {
      return this.unavailable(request, 'GATEWAY_FAILURE', 'AI mode is disabled');
    }

    const providers = this.config.providers.filter((provider) =>
      provider.capabilities.includes(request.capability) &&
      (request.allowExternal !== false || provider.kind !== 'external'),
    );

    let lastFailure: AiFailure = {
      code: 'PROVIDER_UNAVAILABLE',
      message: 'No eligible AI provider is configured',
      retryable: false,
    };
    let previousProviderFailed = false;

    for (const provider of providers) {
      const breaker = this.breakerFor(provider.id);
      try {
        const value = await breaker.execute(() => withBoundedRetry(
          () => withTimeout(
            provider.execute<TInput, TOutput>(request),
            request.timeoutMs ?? this.options.timeoutMs,
          ),
          (error) => classifyAiError(error, provider.id).retryable,
          { maxAttempts: this.options.retryAttempts },
        ));

        if (previousProviderFailed) {
          return {
            outcome: 'FALLBACK_USED',
            value,
            providerId: provider.id,
            fallbackProviderId: provider.id,
            correlationId: request.correlationId,
            latencyMs: Date.now() - started,
            failure: lastFailure,
          };
        }

        return {
          outcome: 'SUCCESS',
          value,
          providerId: provider.id,
          correlationId: request.correlationId,
          latencyMs: Date.now() - started,
        };
      } catch (error) {
        previousProviderFailed = true;
        lastFailure = error instanceof CircuitOpenError
          ? { code: 'PROVIDER_UNAVAILABLE', message: error.message, retryable: true, providerId: provider.id }
          : classifyAiError(error, provider.id);
      }
    }

    return {
      outcome: this.failureOutcome(lastFailure.code),
      correlationId: request.correlationId,
      latencyMs: Date.now() - started,
      failure: lastFailure,
    };
  }

  private breakerFor(providerId: string): CircuitBreaker {
    let breaker = this.breakers.get(providerId);
    if (!breaker) {
      breaker = new CircuitBreaker(providerId, {
        failureThreshold: this.options.circuitFailureThreshold,
        cooldownMs: this.options.circuitCooldownMs,
      });
      this.breakers.set(providerId, breaker);
    }
    return breaker;
  }

  private unavailable<TInput, TOutput>(request: AiRequest<TInput>, code: AiFailure['code'], message: string): AiResult<TOutput> {
    const failure: AiFailure = { code, message, retryable: false };
    return { outcome: this.failureOutcome(code), correlationId: request.correlationId, latencyMs: 0, failure };
  }

  private failureOutcome(code: AiFailure['code']): 'UNAVAILABLE' | 'RATE_LIMITED' | 'TIMEOUT' | 'PROVIDER_ERROR' | 'NETWORK_ERROR' | 'AUTH_ERROR' | 'POLICY_BLOCKED' {
    switch (code) {
      case 'RATE_LIMITED':
      case 'QUOTA_EXHAUSTED': return 'RATE_LIMITED';
      case 'TIMEOUT': return 'TIMEOUT';
      case 'AUTHENTICATION_FAILURE': return 'AUTH_ERROR';
      case 'POLICY_BLOCKED': return 'POLICY_BLOCKED';
      case 'DNS_FAILURE':
      case 'NETWORK_FAILURE': return 'NETWORK_ERROR';
      case 'PROVIDER_UNAVAILABLE':
      case 'LOCAL_AI_UNAVAILABLE':
      case 'MODEL_UNAVAILABLE': return 'UNAVAILABLE';
      default: return 'PROVIDER_ERROR';
    }
  }
}
