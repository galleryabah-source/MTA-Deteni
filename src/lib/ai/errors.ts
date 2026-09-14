import type { AiFailure, AiFailureCode } from './types';

export function classifyAiError(error: unknown, providerId?: string): AiFailure {
  const message = error instanceof Error ? error.message : String(error);
  const status = typeof error === 'object' && error !== null && 'status' in error
    ? Number((error as { status?: unknown }).status)
    : undefined;

  let code: AiFailureCode = 'UNKNOWN';
  let retryable = false;

  if (status === 401 || status === 403) {
    code = 'AUTHENTICATION_FAILURE';
  } else if (status === 429) {
    code = 'RATE_LIMITED';
    retryable = true;
  } else if (status !== undefined && status >= 500) {
    code = 'PROVIDER_5XX';
    retryable = true;
  } else if (/timeout|timed out|deadline/i.test(message)) {
    code = 'TIMEOUT';
    retryable = true;
  } else if (/dns|getaddrinfo|name resolution/i.test(message)) {
    code = 'DNS_FAILURE';
    retryable = true;
  } else if (/network|socket|connection|fetch failed/i.test(message)) {
    code = 'NETWORK_FAILURE';
    retryable = true;
  } else if (/quota|insufficient quota/i.test(message)) {
    code = 'QUOTA_EXHAUSTED';
  } else if (/unavailable|overloaded/i.test(message)) {
    code = 'PROVIDER_UNAVAILABLE';
    retryable = true;
  } else if (/model/i.test(message) && /not found|unavailable|disabled/i.test(message)) {
    code = 'MODEL_UNAVAILABLE';
  }

  return { code, message, retryable, providerId };
}

export function outcomeForFailure(failure: AiFailure): Exclude<AiFailure['code'], 'UNKNOWN'> | 'UNKNOWN' {
  return failure.code;
}
