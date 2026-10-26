export type AiProviderKind = 'deterministic' | 'local' | 'private' | 'external';

export type AiFailureCode =
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'QUOTA_EXHAUSTED'
  | 'PROVIDER_5XX'
  | 'PROVIDER_UNAVAILABLE'
  | 'DNS_FAILURE'
  | 'NETWORK_FAILURE'
  | 'AUTHENTICATION_FAILURE'
  | 'MODEL_UNAVAILABLE'
  | 'GATEWAY_FAILURE'
  | 'LOCAL_AI_UNAVAILABLE'
  | 'POLICY_BLOCKED'
  | 'UNKNOWN';

export type AiOutcome =
  | 'SUCCESS'
  | 'FALLBACK_USED'
  | 'UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'POLICY_BLOCKED';

export interface AiRequest<TInput> {
  capability: string;
  input: TInput;
  correlationId: string;
  timeoutMs?: number;
  idempotencyKey?: string;
  allowExternal?: boolean;
  metadata?: Readonly<Record<string, string>>;
}

export interface AiFailure {
  code: AiFailureCode;
  message: string;
  retryable: boolean;
  providerId?: string;
}

export type AiResult<TOutput> =
  | {
      outcome: 'SUCCESS';
      value: TOutput;
      providerId: string;
      correlationId: string;
      latencyMs: number;
    }
  | {
      outcome: 'FALLBACK_USED';
      value: TOutput;
      providerId: string;
      fallbackProviderId: string;
      correlationId: string;
      latencyMs: number;
      failure?: AiFailure;
    }
  | {
      outcome: Exclude<AiOutcome, 'SUCCESS' | 'FALLBACK_USED'>;
      correlationId: string;
      latencyMs: number;
      failure: AiFailure;
    };

export interface AiProvider {
  readonly id: string;
  readonly kind: AiProviderKind;
  readonly capabilities: readonly string[];
  execute<TInput, TOutput>(request: AiRequest<TInput>): Promise<TOutput>;
}

export interface AiGateway {
  execute<TInput, TOutput>(request: AiRequest<TInput>): Promise<AiResult<TOutput>>;
}
